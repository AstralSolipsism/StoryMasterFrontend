from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 1. Load the Scripts page
        print("Loading Scripts page...")
        page.goto("http://localhost:5173/scripts")
        page.wait_for_load_state("networkidle")
        
        # 2. Click on the first script
        print("Selecting 'Shadows over Brook'...")
        page.get_by_text("Shadows over Brook").click()
        
        # 3. Verify Scenario Tab content
        print("Verifying Scenario tab...")
        page.wait_for_selector("text=The Plea") # Chapter title
        
        # 4. Switch to Characters Tab
        print("Switching to Characters tab...")
        page.get_by_role("button", name="Characters").click()
        page.wait_for_selector("text=Village Elder")
        
        # 5. Click a Character
        print("Clicking 'Village Elder'...")
        page.get_by_text("Village Elder").click()
        
        # 6. Verify Detail Overlay
        print("Verifying detail overlay...")
        page.wait_for_selector("h3:has-text('Village Elder')")
        
        # 7. Check Graph
        print("Checking Graph container...")
        graph = page.locator(".bg-white\\/30") # The graph container class
        if graph.count() > 0:
            print("Graph container found.")
        else:
            print("Graph container MISSING.")

        # Take screenshot
        page.screenshot(path="scripts_interactive.png")
        print("Screenshot taken successfully: scripts_interactive.png")

        browser.close()

if __name__ == "__main__":
    run()
