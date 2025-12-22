import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Update this URL to match your local dev server
        # Port might be 5173 or 5174 depending on vite
        page.goto("http://localhost:5173/dm")
        
        print("Loading DM page...")
        page.wait_for_selector("text=Dungeon Master Control Plane", timeout=10000)

        # Wait for graph to render
        time.sleep(2) 

        # Verify Sidebar is hidden initially (or empty state)
        if page.is_visible("text=Select an Agent Node"):
            print("Empty state visible.")
        else:
            print("Error: Empty state not visible.")

        # Attempt to click a node. 
        # Since it's a canvas, we click relative coordinates. 
        # Dagre LR layout: Input Processor (left) -> ...
        # We try clicking near the left-center of the canvas.
        canvas = page.locator("canvas")
        box = canvas.bounding_box()
        if box:
            # Click slightly right of the left edge, mid-height
            click_x = box['x'] + 100 
            click_y = box['y'] + (box['height'] / 2)
            page.mouse.click(click_x, click_y)
            print(f"Clicked at {click_x}, {click_y}")
            
            time.sleep(1)

            # Check if Sidebar opened (look for specific agent name or 'Agent Configuration')
            # 'Input Processor' is likely the first node
            if page.is_visible("text=Input Processor") or page.is_visible("text=Narrator"):
                print("Sidebar opened successfully.")
                
                # Verify Config Fields
                if page.is_visible("text=Creativity (Temperature)"):
                    print("Config fields visible.")
                
                # Verify Model Dropdown
                try:
                    val = page.input_value("select", timeout=2000)
                    print(f"Current model: {val}")
                except:
                    print("Could not read select value, possibly rendering delay.")

            else:
                print("Sidebar did not open. Trying another coordinate...")
                # Try center
                page.mouse.click(box['x'] + box['width']/2, box['y'] + box['height']/2)
                time.sleep(1)
                if page.is_visible("text=Directives & Rules"):
                     print("Sidebar opened (Center click).")
                else:
                     print("Sidebar still not open.")

        page.screenshot(path="dm_interactive.png")
        print("Screenshot taken successfully: dm_interactive.png")

        browser.close()

if __name__ == "__main__":
    run()
