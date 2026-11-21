"""
Generate PNG icons for EduAssist DYPSEM PWA
Requires: pip install Pillow
"""
import os
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

def draw_icon(size, maskable=False):
    """Create the EduAssist icon at given size."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    padding = int(size * (0.1 if maskable else 0))
    
    # Background circle or rect (maskable uses full square with padding)
    navy = (30, 58, 95, 255)
    amber = (245, 158, 11, 255)
    white = (255, 255, 255, 255)
    
    if maskable:
        draw.rectangle([0, 0, size, size], fill=navy)
        inner = int(size * 0.12)
    else:
        draw.ellipse([2, 2, size-2, size-2], fill=navy)
        inner = int(size * 0.08)
    
    # Outer ring
    ring_w = max(2, int(size * 0.02))
    draw.ellipse([inner, inner, size-inner, size-inner], outline=amber, width=ring_w)
    
    s = size
    
    # --- Chat bubble body ---
    bx1 = int(s * 0.20)
    by1 = int(s * 0.38)
    bx2 = int(s * 0.80)
    by2 = int(s * 0.78)
    radius_b = int(s * 0.08)
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=radius_b, fill=white)
    
    # Chat bubble tail (small triangle)
    tx = int(s * 0.30)
    ty = by2
    draw.polygon([(tx, ty), (tx - int(s*0.08), ty + int(s*0.12)), (tx + int(s*0.08), ty)], fill=white)
    
    # --- Graduation cap ---
    # Cap brim (rectangle)
    cap_y = int(s * 0.28)
    cap_h = int(s * 0.07)
    draw.rounded_rectangle([int(s*0.25), cap_y, int(s*0.75), cap_y + cap_h], radius=int(s*0.03), fill=amber)
    
    # Cap top (triangle pointing up)
    top_y = int(s * 0.14)
    draw.polygon(
        [(int(s*0.5), top_y), (int(s*0.22), cap_y+1), (int(s*0.78), cap_y+1)],
        fill=navy
    )
    
    # Tassel
    tassel_x = int(s * 0.74)
    draw.rectangle([tassel_x, cap_y, tassel_x + int(s*0.03), cap_y + int(s*0.12)], fill=amber)
    draw.ellipse([tassel_x - int(s*0.01), cap_y + int(s*0.11), tassel_x + int(s*0.04), cap_y + int(s*0.17)], fill=amber)
    
    # --- "AI" text in chat bubble center ---
    mid_x = s // 2
    mid_y = int(s * 0.56)
    
    # Try to draw text; if font fails, draw simple shapes
    try:
        font_size = max(10, int(s * 0.18))
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.load_default()
        except:
            font = None
    
    if font:
        bbox = draw.textbbox((0, 0), "AI", font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((mid_x - tw//2, mid_y - th//2), "AI", fill=navy, font=font)
    else:
        # Fallback: draw two rectangles as placeholder
        draw.rectangle([mid_x - int(s*0.09), mid_y - int(s*0.06), mid_x + int(s*0.09), mid_y + int(s*0.06)], fill=navy)
    
    return img

def main():
    out_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'icons')
    os.makedirs(out_dir, exist_ok=True)
    
    if not PIL_AVAILABLE:
        print("Pillow not available. Creating placeholder icons...")
        # Create minimal valid 1x1 PNG placeholders
        # Actual PNG bytes for a 1x1 blue pixel
        import struct, zlib
        def create_minimal_png(width, height, color):
            def png_chunk(chunk_type, data):
                chunk_len = struct.pack('>I', len(data))
                chunk_data = chunk_type + data
                chunk_crc = struct.pack('>I', zlib.crc32(chunk_data) & 0xffffffff)
                return chunk_len + chunk_data + chunk_crc
            
            signature = b'\x89PNG\r\n\x1a\n'
            ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
            ihdr = png_chunk(b'IHDR', ihdr_data)
            
            r, g, b = color
            raw_rows = []
            for _ in range(height):
                row = b'\x00' + bytes([r, g, b] * width)
                raw_rows.append(row)
            raw_data = b''.join(raw_rows)
            compressed = zlib.compress(raw_data)
            idat = png_chunk(b'IDAT', compressed)
            iend = png_chunk(b'IEND', b'')
            
            return signature + ihdr + idat + iend
        
        for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (512, 'icon-maskable-512.png')]:
            path = os.path.join(out_dir, name)
            png_data = create_minimal_png(size, size, (30, 58, 95))
            with open(path, 'wb') as f:
                f.write(png_data)
            print(f"Created placeholder: {path}")
        return
    
    configs = [
        (192, 'icon-192.png', False),
        (512, 'icon-512.png', False),
        (512, 'icon-maskable-512.png', True),
    ]
    
    for size, name, maskable in configs:
        icon = draw_icon(size, maskable)
        path = os.path.join(out_dir, name)
        icon.save(path, 'PNG')
        print(f"Generated: {path} ({size}x{size}, maskable={maskable})")
    
    print("All icons generated successfully!")

if __name__ == '__main__':
    main()
