#!/usr/bin/env python3
"""
Generate poster images from videos in static/videos directory.
Saves optimized WebP images to static/images/posters with matching directory structure.
"""

import os
import subprocess
import sys
import argparse
from pathlib import Path

# Base directories
VIDEOS_DIR = Path("static/videos")
POSTERS_DIR = Path("static/images/posters")

def ensure_directory(path):
    """Create directory if it doesn't exist."""
    path.mkdir(parents=True, exist_ok=True)

def extract_poster(video_path, poster_path, quality=95):
    """
    Extract a frame from video and save as optimized WebP poster.
    Uses near-lossless WebP compression (quality 95) for web optimization.
    """
    # Extract first frame and convert directly to WebP
    # Using vcodec=libwebp for WebP encoding
    # Quality 95 for near-lossless compression (0-100, 100 is lossless)
    # Using preset 'picture' for better quality photos
    cmd = [
        "ffmpeg",
        "-i", str(video_path),
        "-vf", "select=eq(n\\,0)",  # Select first frame
        "-frames:v", "1",
        "-vcodec", "libwebp",
        "-quality", f"{quality}",  # Near-lossless quality (0-100, 100 is lossless)
        "-preset", "picture",  # Preset for digital pictures (better quality)
        "-y",  # Overwrite if exists
        str(poster_path)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error processing {video_path}: {e.stderr}", file=sys.stderr)
        return False

def get_poster_path(video_path):
    """Convert video path to corresponding poster path."""
    # Get relative path from videos directory
    rel_path = video_path.relative_to(VIDEOS_DIR)
    
    # Remove all extensions and add .webp
    # Handle cases like .mp4.mp4 by removing all extensions
    stem = rel_path.stem
    # Keep removing .mp4 extensions until we get the base name
    while stem.endswith('.mp4'):
        stem = Path(stem).stem
    
    # Build poster path maintaining directory structure
    poster_path = POSTERS_DIR / rel_path.parent / f"{stem}.webp"
    
    return poster_path

def process_videos(force=False, quality=95):
    """Process all video files in the videos directory.
    
    Args:
        force: If True, regenerate all posters even if they exist.
    """
    if not VIDEOS_DIR.exists():
        print(f"Error: {VIDEOS_DIR} does not exist", file=sys.stderr)
        return False
    
    # Find all video files
    video_extensions = {'.mp4', '.mp4.mp4', '.mov', '.avi', '.mkv'}
    video_files = []
    
    for root, dirs, files in os.walk(VIDEOS_DIR):
        for file in files:
            if any(file.endswith(ext) for ext in video_extensions):
                video_path = Path(root) / file
                video_files.append(video_path)
    
    if not video_files:
        print(f"No video files found in {VIDEOS_DIR}")
        return False
    
    print(f"Found {len(video_files)} video files")
    
    processed = 0
    skipped = 0
    errors = 0
    
    for video_path in sorted(video_files):
        poster_path = get_poster_path(video_path)
        
        # Skip if poster already exists and is newer than video (unless force)
        if not force and poster_path.exists():
            if poster_path.stat().st_mtime >= video_path.stat().st_mtime:
                print(f"Skipping {video_path.name} (poster already exists and is up to date)")
                skipped += 1
                continue
        
        # Ensure poster directory exists
        ensure_directory(poster_path.parent)
        
        print(f"Processing: {video_path.name} -> {poster_path.name}")
        
        if extract_poster(video_path, poster_path, quality):
            processed += 1
        else:
            errors += 1
    
    print(f"\nSummary:")
    print(f"  Processed: {processed}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors: {errors}")
    
    return errors == 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate poster images from videos")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate all posters even if they already exist"
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=95,
        help="Regenerate all posters even if they already exist"
    )
    args = parser.parse_args()
    
    success = process_videos(force=args.force, quality=args.quality)
    sys.exit(0 if success else 1)

