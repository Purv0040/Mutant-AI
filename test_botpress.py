import sys
from pathlib import Path

# Allow importing backend services when running from project root.
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from services.botpress import list_botpress_files, upload_file_to_botpress


def main():
    print("Listing existing Botpress files...")
    files = list_botpress_files()
    for item in files:
        print(item)

    test_file = Path("test_hr_policy.txt")
    test_file.write_text(
        "HR Leave Policy:\n"
        "Employees are entitled to 18 paid leave days per year.\n"
        "Medical leave requires a valid doctor certificate for absences longer than 2 days.\n"
        "Carry forward is limited to 5 days per calendar year.\n",
        encoding="utf-8",
    )

    print("\nUploading test_hr_policy.txt to Botpress...")
    result = upload_file_to_botpress(str(test_file), test_file.name, user_id=1)
    print("Upload result:", result)

    if result.get("botpress_file_id"):
        print("Success: botpress_file_id returned:", result["botpress_file_id"])
    else:
        print("Failed: no botpress_file_id returned")


if __name__ == "__main__":
    main()
