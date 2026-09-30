from pydantic import BaseModel
from typing import Optional


class VulnerabilityOut(BaseModel):
    id: int
    device_id: int
    issue_title: str
    severity: str
    remediation_command: str
    is_fixed: bool
    hostname: Optional[str] = None
    vendor: Optional[str] = None

    class Config:
        from_attributes = True


class DeviceOut(BaseModel):
    id: int
    hostname: str
    vendor: str
    ip_address: str
    status: str
    vuln_count: int = 0
    critical_count: int = 0
    fixed_count: int = 0

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_devices: int
    critical_risks: int
    open_vulns: int
    compliance_score: float
    remediated: int
