"""
FreshSense AI - Agentic Pipeline
Analyzes shelf-life countdown and suggests clearance pricing.
"""

class FreshSenseAgent:
    def analyze_expiry_risk(self, item_name: str, days_left: int) -> str:
        if days_left <= 1:
            return f"CRITICAL: {item_name} expires in {days_left} day. Recommend 30% Markdown."
        return f"HEALTHY: {item_name} stock is stable."

if __name__ == "__main__":
    agent = FreshSenseAgent()
    print(agent.analyze_expiry_risk("Amul Taaza Milk", 1))