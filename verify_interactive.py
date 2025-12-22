from playwright.sync_api import sync_playwright

def verify_interactive_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the local server
            page.goto("http://localhost:5173/rulebook")
            
            # 1. Verify Core Rules chapter loads
            print("Verifying Core Rules chapter...")
            page.wait_for_selector("text=The core rules describe how to play the game")
            
            # 2. Click the 'Spells' chapter in the sidebar
            print("Clicking Spells chapter...")
            page.get_by_text("Spells", exact=True).click()
            
            # 3. Verify Spells content loads
            page.wait_for_selector("text=Magic is a fundamental part of the world")
            
            # 4. Click an Entity link (e.g., [Fireball])
            print("Clicking [Fireball] entity link...")
            # Note: The text in the HTML is just "Fireball" inside a span with class entity-link
            page.locator(".entity-link", has_text="Fireball").click()
            
            # 5. Verify Entity Details load (Description and Graph container visible)
            page.wait_for_selector("h3:has-text('Fireball')")
            page.wait_for_selector("text=A bright streak flashes from your pointing finger")
            
            # 6. Take a screenshot of the Entity View with Graph
            # Wait a bit for the graph to potentially render (though canvas might be empty in headless if webgl issues, the container should be there)
            page.wait_for_timeout(1000) 
            page.screenshot(path="/home/jules/verification/rulebook_interactive.png", full_page=True)
            print("Screenshot taken successfully: rulebook_interactive.png")
            
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_interactive_frontend()
