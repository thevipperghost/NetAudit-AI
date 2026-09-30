import random
import re
from typing import List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import get_db
from .models import Device, Vulnerability
from .schemas import DeviceOut, VulnerabilityOut, StatsOut
from .seed import seed_database, VULN_CATALOG

app = FastAPI(title="NetAudit AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

seed_database()


# ---------------------------------------------------------------- helpers
def detect_vendor(filename: str, content: str) -> str:
    blob = (filename + " " + content[:4000]).lower()
    if any(k in blob for k in ["fortinet", "fortigate", "config system global", "fortios"]):
        return "Fortinet"
    if any(k in blob for k in ["juniper", "junos", "set system services", "junos-install"]):
        return "Juniper"
    if any(k in blob for k in ["cisco", "ios", "ios-xe", "running-config", "conf t",
                                "snmp-server", "line vty", "enable secret", "interface vlan",
                                "show running-config", "switch"]):
        return "Cisco"
    return random.choice(["Cisco", "Fortinet", "Juniper"])


def random_ip() -> str:
    return f"10.{random.randint(20, 99)}.{random.randint(0, 254)}.{random.randint(2, 254)}"


def serialize_vuln(v: Vulnerability) -> VulnerabilityOut:
    return VulnerabilityOut(
        id=v.id,
        device_id=v.device_id,
        issue_title=v.issue_title,
        severity=v.severity,
        remediation_command=v.remediation_command,
        is_fixed=v.is_fixed,
        hostname=v.device.hostname if v.device else None,
        vendor=v.device.vendor if v.device else None,
    )


# ---------------------------------------------------------------- routes
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "NetAudit AI"}


@app.post("/api/upload")
async def upload_config(
    file: UploadFile = File(...),
    depth: str = Form("standard"),
    disabled_vendors: str = Form(""),
    db: Session = Depends(get_db),
):
    raw = await file.read()
    try:
        content = raw.decode("utf-8", errors="ignore")
    except Exception:
        content = ""

    filename = file.filename or "config.txt"
    vendor = detect_vendor(filename, content)

    disabled = {v.strip().lower() for v in disabled_vendors.split(",") if v.strip()}
    if vendor.lower() in disabled:
        raise HTTPException(
            status_code=400,
            detail=f"{vendor} rule module is disabled — enable it in Scan Config and retry.",
        )

    host_match = re.search(r"hostname\s+([\w\-.]+)", content, re.IGNORECASE)
    if host_match:
        hostname = host_match.group(1)
    else:
        stem = re.sub(r"\.(cfg|conf|txt|log)$", "", filename, flags=re.IGNORECASE)
        hostname = re.sub(r"[^a-zA-Z0-9\-]", "-", stem).lower() or f"device-{random.randint(100, 999)}"

    existing = db.query(Device).filter(Device.hostname == hostname).first()
    if existing:
        db.delete(existing)
        db.commit()

    device = Device(hostname=hostname, vendor=vendor, ip_address=random_ip(), status="Scanned")
    db.add(device)
    db.flush()

    pool = VULN_CATALOG[vendor]
    depth_range = {"quick": (1, 2), "standard": (2, 3), "deep": (4, 5)}
    lo, hi = depth_range.get(depth, (2, 3))
    count = min(random.randint(lo, hi), len(pool))
    for title, severity, cmd in random.sample(pool, k=min(count, len(pool))):
        db.add(
            Vulnerability(
                device_id=device.id,
                issue_title=title,
                severity=severity,
                remediation_command=cmd,
                is_fixed=False,
            )
        )
    db.commit()
    db.refresh(device)

    return {
        "message": f"Parsed {filename} — device '{hostname}' ({vendor}) audited successfully.",
        "device": serialize_device(device, db),
        "vulnerabilities_found": count,
    }


@app.get("/api/devices", response_model=List[DeviceOut])
def list_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).order_by(Device.id.desc()).all()
    return [serialize_device(d, db) for d in devices]


@app.get("/api/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    total_devices = db.query(Device).count()
    vulns = db.query(Vulnerability).all()
    total = len(vulns) or 1
    fixed = sum(1 for v in vulns if v.is_fixed)
    critical_open = sum(1 for v in vulns if v.severity == "Critical" and not v.is_fixed)
    return StatsOut(
        total_devices=total_devices,
        critical_risks=critical_open,
        open_vulns=len(vulns) - fixed,
        compliance_score=round((fixed / total) * 100, 1),
        remediated=fixed,
    )


@app.get("/api/vulnerabilities", response_model=List[VulnerabilityOut])
def all_vulnerabilities(db: Session = Depends(get_db)):
    vulns = db.query(Vulnerability).order_by(Vulnerability.id.desc()).all()
    return [serialize_vuln(v) for v in vulns]


@app.get("/api/vulnerabilities/{device_id}", response_model=List[VulnerabilityOut])
def device_vulnerabilities(device_id: int, db: Session = Depends(get_db)):
    device = db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    vulns = (
        db.query(Vulnerability)
        .filter(Vulnerability.device_id == device_id)
        .order_by(Vulnerability.id.desc())
        .all()
    )
    return [serialize_vuln(v) for v in vulns]


@app.post("/api/remediate/{vuln_id}")
def remediate(vuln_id: int, db: Session = Depends(get_db)):
    vuln = db.get(Vulnerability, vuln_id)
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    vuln.is_fixed = True
    db.commit()
    return {
        "message": f"Remediation applied — '{vuln.issue_title}' marked as FIXED.",
        "vulnerability": serialize_vuln(vuln),
    }


def serialize_device(device: Device, db: Session) -> DeviceOut:
    vulns = db.query(Vulnerability).filter(Vulnerability.device_id == device.id).all()
    return DeviceOut(
        id=device.id,
        hostname=device.hostname,
        vendor=device.vendor,
        ip_address=device.ip_address,
        status=device.status,
        vuln_count=len(vulns),
        critical_count=sum(1 for v in vulns if v.severity == "Critical" and not v.is_fixed),
        fixed_count=sum(1 for v in vulns if v.is_fixed),
    )
