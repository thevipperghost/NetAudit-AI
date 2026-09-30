from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, nullable=False)
    vendor = Column(String, nullable=False)  # Cisco / Fortinet / Juniper
    ip_address = Column(String, nullable=False)
    status = Column(String, default="Scanned")  # Scanned / Critical / Compliant

    vulnerabilities = relationship(
        "Vulnerability", back_populates="device", cascade="all, delete-orphan"
    )


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    issue_title = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # Critical / High / Medium / Low
    remediation_command = Column(String, nullable=False)
    is_fixed = Column(Boolean, default=False)

    device = relationship("Device", back_populates="vulnerabilities")
