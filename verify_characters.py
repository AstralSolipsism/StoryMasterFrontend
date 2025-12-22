from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 1. Load the Characters page
        print("Loading Characters page...")
        page.goto("http://localhost:5173/characters")
        page.wait_for_load_state("networkidle")
        
        # 2. Select Character
        print("Selecting 'Elara Moonwhisper'...")
        # Since it's the first one, it might be auto-selected, but let's click to be sure
        page.get_by_text("Elara Moonwhisper").first.click()
        
        # 3. Verify Stats
        print("Verifying Stats...")
        page.wait_for_selector("text=INT")
        page.wait_for_selector("text=17") # Int Value
        
        # 4. Verify Combat Stats
        print("Verifying Combat Stats...")
        page.wait_for_selector("text=AC")
        page.wait_for_selector("text=12") # Elara AC
        page.wait_for_selector("text=HP")
        
        # 5. Verify Attacks
        print("Verifying Attacks...")
        # Firebolt is an attack in the mock data
        page.wait_for_selector("text=Firebolt")
        
        # 6. Verify Features
        print("Verifying Features...")
        page.wait_for_selector("text=Darkvision")
        
        # Take screenshot
        page.screenshot(path="characters_interactive.png")
        print("Screenshot taken successfully: characters_interactive.png")

        browser.close()

if __name__ == "__main__":
    run()
