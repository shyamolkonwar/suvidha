"""AI Processor Service - Analyzes grievance priority and categorization"""
import re
from typing import Optional
from app.models import GrievanceCategory, GrievancePriority


class AIProcessor:
    """Simple AI-based grievance analysis using keyword matching"""

    # High priority keywords
    HIGH_PRIORITY_KEYWORDS = [
        "fire", "spark", "shock", "electrocution", "burning",
        "emergency", "urgent", "critical", "danger", "hazard",
        "explosion", "leak", "gas", "no water", "flood"
    ]

    # Medium priority keywords
    MEDIUM_PRIORITY_KEYWORDS = [
        "power outage", "no electricity", "bill issue", "overcharge",
        "meter problem", "connection", "disconnection", "delay"
    ]

    @staticmethod
    def analyze_priority(description: str, category: GrievanceCategory) -> GrievancePriority:
        """
        Analyze grievance description to determine priority
        Uses keyword matching for quick classification
        """
        description_lower = description.lower()

        # Check for high priority keywords
        for keyword in AIProcessor.HIGH_PRIORITY_KEYWORDS:
            if keyword in description_lower:
                return GrievancePriority.CRITICAL if any(
                    kw in description_lower for kw in ["fire", "shock", "electrocution", "explosion"]
                ) else GrievancePriority.HIGH

        # Check for medium priority keywords
        for keyword in AIProcessor.MEDIUM_PRIORITY_KEYWORDS:
            if keyword in description_lower:
                return GrievancePriority.MEDIUM

        # Category-based defaults
        if category == GrievanceCategory.POWER_OUTAGE:
            return GrievancePriority.HIGH
        elif category == GrievanceCategory.METER_PROBLEM:
            return GrievancePriority.MEDIUM
        elif category == GrievanceCategory.BILLING_ISSUE:
            return GrievancePriority.LOW

        return GrievancePriority.LOW

    @staticmethod
    def estimate_resolution_time(priority: GrievancePriority) -> str:
        """
        Estimate resolution time based on priority
        """
        estimates = {
            GrievancePriority.CRITICAL: "2 Hours",
            GrievancePriority.HIGH: "12 Hours",
            GrievancePriority.MEDIUM: "24 Hours",
            GrievancePriority.LOW: "48 Hours"
        }
        return estimates.get(priority, "48 Hours")

    @staticmethod
    def extract_entities(description: str) -> dict:
        """
        Extract entities like location, consumer ID from description
        Simple pattern matching
        """
        entities = {
            "location": None,
            "consumer_id": None,
            "phone": None
        }

        # Extract consumer ID patterns (e.g., KC-001, CON-12345)
        consumer_pattern = r"\\b(?:KC|CON|CID)[-–]?[0-9A-Z]+\\b"
        matches = re.findall(consumer_pattern, description, re.IGNORECASE)
        if matches:
            entities["consumer_id"] = matches[0].upper()

        # Extract location patterns (e.g., Sector 4, Block A)
        location_pattern = r"\\b(?:Sector|Block|Zone|Ward)\\s+[A-Z0-9]+\\b"
        matches = re.findall(location_pattern, description, re.IGNORECASE)
        if matches:
            entities["location"] = matches[0]

        return entities

    @staticmethod
    def generate_ticket_id() -> str:
        """Generate unique ticket ID"""
        import uuid
        return f"GRV-{uuid.uuid4().hex[:8].upper()}"


ai_processor = AIProcessor()
