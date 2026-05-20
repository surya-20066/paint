import os
import glob

html_files = glob.glob('*.html')

button_target = '''<button onclick="window.location.href='signin.html'"
                class="hidden sm:block font-sans text-[10px] font-bold uppercase tracking-wider text-stone-900 px-6 py-2.5 border border-stone-900 hover:bg-stone-50 transition-colors">Artist
                Login</button>'''

button_replacement = '''<button onclick="window.location.href='admin-dashboard.html'"
                class="hidden sm:block font-sans text-[10px] font-bold uppercase tracking-wider text-[#B5451B] px-6 py-2.5 border border-[#B5451B] hover:bg-[#B5451B]/5 transition-colors mr-2">Admin</button>
            <button onclick="window.location.href='signin.html'"
                class="hidden sm:block font-sans text-[10px] font-bold uppercase tracking-wider text-stone-900 px-6 py-2.5 border border-stone-900 hover:bg-stone-50 transition-colors">Artist
                Login</button>'''

mobile_target = '''<button onclick="window.location.href='signin.html'"
                class="w-full py-4 border border-stone-900 font-sans text-xs font-bold uppercase tracking-widest">Artist
                Login</button>'''

mobile_replacement = '''<button onclick="window.location.href='admin-dashboard.html'"
                class="w-full py-4 mb-2 border border-[#B5451B] text-[#B5451B] font-sans text-xs font-bold uppercase tracking-widest">Admin</button>
            <button onclick="window.location.href='signin.html'"
                class="w-full py-4 border border-stone-900 font-sans text-xs font-bold uppercase tracking-widest">Artist
                Login</button>'''

for f in html_files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = content.replace(button_target, button_replacement)
        new_content = new_content.replace(mobile_target, mobile_replacement)
        
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Updated {f}')
    except Exception as e:
        print(f"Failed to process {f}: {e}")
