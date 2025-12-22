import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate to Memories
        print("Navigating to Memories View...")
        await page.goto("http://localhost:5173/memories")
        
        # Wait for header
        await page.wait_for_selector("h1:has-text('Adventure Memories')")
        print("Header found.")
        
        # Check sidebar
        sidebar = page.locator(".campaign-list")
        if await sidebar.is_visible():
            print("Sidebar visible.")
        
        # Check default selection (Strahd)
        await page.wait_for_selector("h2:has-text('The Curse of Strahd')")
        print("Default campaign 'The Curse of Strahd' is displayed.")
        
        # Click second campaign (Phandelver)
        print("Switching campaign to 'Lost Mine of Phandelver'...")
        await page.click(".campaign-card:has-text('Lost Mine of Phandelver')")
        
        # Wait for update
        await page.wait_for_selector("h2:has-text('Lost Mine of Phandelver')")
        print("Main view updated to 'Lost Mine of Phandelver'.")
        
        # Check timeline visibility
        timeline = page.locator(".timeline")
        if await timeline.is_visible():
            print("Timeline visualization is visible.")
            
        # Take screenshot
        await page.screenshot(path="memories_verified.png")
        print("Screenshot saved to memories_verified.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
