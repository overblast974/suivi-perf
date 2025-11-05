#!/usr/bin/env python3
"""Generate PWA icons for Suivi Performance app"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes to generate
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

# Colors
bg_color = (99, 102, 241)  # Primary color
text_color = (255, 255, 255)  # White

def create_icon(size):
    """Create a simple icon with gradient background and symbol"""
    # Create image with gradient-like background
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw a simple dumbbell icon
    # Calculate proportions
    weight_width = size // 6
    weight_height = size // 4
    bar_width = size // 10
    bar_height = size // 16
    center_bar_width = size // 3
    center_bar_height = size // 20

    center_x = size // 2
    center_y = size // 2

    # Left weight
    left_x = center_x - size // 3
    draw.rectangle(
        [left_x - weight_width // 2, center_y - weight_height // 2,
         left_x + weight_width // 2, center_y + weight_height // 2],
        fill=text_color
    )

    # Left connecting bar
    draw.rectangle(
        [left_x + weight_width // 2, center_y - bar_height // 2,
         left_x + weight_width // 2 + bar_width, center_y + bar_height // 2],
        fill=text_color
    )

    # Center bar
    draw.rectangle(
        [center_x - center_bar_width // 2, center_y - center_bar_height // 2,
         center_x + center_bar_width // 2, center_y + center_bar_height // 2],
        fill=text_color
    )

    # Right connecting bar
    right_x = center_x + size // 3
    draw.rectangle(
        [right_x - weight_width // 2 - bar_width, center_y - bar_height // 2,
         right_x - weight_width // 2, center_y + bar_height // 2],
        fill=text_color
    )

    # Right weight
    draw.rectangle(
        [right_x - weight_width // 2, center_y - weight_height // 2,
         right_x + weight_width // 2, center_y + weight_height // 2],
        fill=text_color
    )

    # Draw some stats dots at the bottom (simple circles)
    dot_radius = size // 50
    dot_y = center_y + size // 3
    for i, x in enumerate([center_x - size // 5, center_x - size // 15, center_x + size // 15, center_x + size // 5]):
        y_offset = [0, -size // 30, size // 40, -size // 25][i]
        draw.ellipse(
            [x - dot_radius, dot_y + y_offset - dot_radius,
             x + dot_radius, dot_y + y_offset + dot_radius],
            fill=text_color
        )

    return img

def main():
    """Generate all icon sizes"""
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)

    print('Generating PWA icons...')
    for size in sizes:
        filename = f'icon-{size}.png'
        filepath = os.path.join(icons_dir, filename)

        img = create_icon(size)
        img.save(filepath, 'PNG')
        print(f'✓ Created {filename} ({size}x{size})')

    print(f'\n✓ Successfully generated {len(sizes)} icons')

if __name__ == '__main__':
    main()
