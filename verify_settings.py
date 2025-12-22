import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate to Settings
        print("Navigating to Settings View...")
        await page.goto("http://localhost:5173/settings")
        
        # Wait for header
        await page.wait_for_selector("h1:has-text('System Configuration')")
        print("Header found.")
        
        # Check cards
        llm_card = page.locator("h2:has-text('LLM Nexus')")
        rules_card = page.locator("h2:has-text('Cosmic Rules')")
        
        if await llm_card.is_visible() and await rules_card.is_visible():
            print("Settings cards visible.")
        else:
            print("ERROR: Settings cards not found.")
            await browser.close()
            return

        # Interact with API Key
        print("Entering API Key...")
        await page.fill("input[type='password']", "sk-test-key-12345")
        
        # Test Connection
        print("Testing Connection...")
        await page.click("button:has-text('Test Connection')")
        
        # Wait for mock success message
        try:
            await page.wait_for_selector(".success:has-text('Connection Established!')", timeout=3000)
            print("Connection test successful.")
        except Exception as e:
            print(f"ERROR: Connection test failed or timed out: {e}")
        
        # Save Configuration (Handle Alert)
        print("Saving Configuration...")
        
        # Setup dialog handler
        dialog_message = ""
        async def handle_dialog(dialog):
            nonlocal dialog_message
            dialog_message = dialog.message
            print(f"Alert received: {dialog.message}")
            await dialog.accept()
            
        page.on("dialog", handle_dialog)
        
        await page.click("button:has-text('Inscribe Configuration')")
        
        # Give a moment for the dialog to trigger
        await asyncio.sleep(1)
        
        if "Inscribe Configuration" in dialog_message or "Inscribed" in dialog_message:
            print("Save confirmed via alert.")
        else:
            print(f"Warning: Unexpected alert message: {dialog_message}")

        # Take screenshot
        await page.screenshot(path="settings_verified.png")
        print("Screenshot saved to settings_verified.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
