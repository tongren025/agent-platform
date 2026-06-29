"""Merge new cards from shots_data.json into cards.json."""
import json, sys

def main():
    shots_path = "D:/P/agent/scripts/shots_data.json"
    cards_path = "D:/P/agent/data/production/jiulu-s1/cards.json"

    with open(shots_path, "r", encoding="utf-8") as f:
        new_cards = json.load(f)
    with open(cards_path, "r", encoding="utf-8") as f:
        existing = json.load(f)

    existing_ids = {c["card_id"] for c in existing}
    added = [c for c in new_cards if c["card_id"] not in existing_ids]
    existing.extend(added)

    with open(cards_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f"Added {len(added)} new cards (skipped {len(new_cards)-len(added)} dupes). Total: {len(existing)}")

if __name__ == "__main__":
    main()
