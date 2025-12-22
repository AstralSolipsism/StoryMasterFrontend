from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the local server
            page.goto("http://localhost:5173/rulebook")
            
            # Wait for the rulebook header to be visible (ensures app loaded)
            page.wait_for_selector("h2.text-3xl.font-serif")
            
            # Take a full page screenshot
            page.screenshot(path="/home/jules/verification/rulebook_verification.png", full_page=True)
            print("Screenshot taken successfully")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
