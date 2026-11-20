#!/bin/bash
# Usage: ./render_all.sh <outDir> <w> <h>   — renders all 1350 frames in 4 parallel shards
set -e
out=$1; w=$2; h=$3
rm -rf "$out"; mkdir -p "$out"
for i in 0 1 2 3; do
  a=$((i*338)); b=$(((i+1)*338)); [ $b -gt 1350 ] && b=1350
  node render.mjs "$out" $w $h 30 $a $b > "$out/log$i.txt" 2>&1 &
done
wait
ls "$out"/*.png | wc -l
