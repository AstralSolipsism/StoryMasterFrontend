from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Listen for console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        
        # 1. Navigate to Play View
        print("Navigating to Play View...")
        page.goto("http://localhost:5173/play")
        page.wait_for_selector("text=Dungeon Master AI")
        
        # 2. Test Chat Interaction
        print("Testing Chat...")
        # Check initial messages
        assert page.is_visible("text=You stand before the ancient stone doors")
        
        # Send a message via Enter key
        print("Typing message...")
        page.fill("textarea", "I cast Magic Missile at the darkness!")
        print("Pressing Enter...")
        page.press("textarea", "Enter")
        
        # Verify user message appeared
        print("Waiting for message to appear...")
        try:
            page.wait_for_selector("text=I cast Magic Missile at the darkness!", timeout=5000)
            print("Message appeared.")
        except Exception as e:
            print("Message did not appear. Capturing debug screenshot.")
            page.screenshot(path="play_debug.png")
            raise e
        
        # Wait for AI response (mocked with timeout)
        print("Waiting for AI response...")
        time.sleep(2) # Wait for the 1.5s mock delay
        assert page.is_visible("text=Simulating logic for")
        
        # 3. Test Reference Book Tabs
        print("Testing Reference Book...")
        # Initial tab should be Character
        assert page.is_visible("text=Valerius")
        assert page.is_visible("text=STR")
        
        # Switch to Spells
        page.click("text=Spells")
        page.wait_for_selector("text=Grimoire")
        assert page.is_visible("text=Magic Missile")
        
        # Switch to Scene
        page.click("text=Scene")
        page.wait_for_selector("text=Current Location")
        assert page.is_visible("text=Goblin Scout")
        
        # 4. Capture Screenshot
        print("Capturing screenshot...")
        page.screenshot(path="play_verified.png")
        
        browser.close()
        print("Verification successful!")

if __name__ == "__main__":
    run()
