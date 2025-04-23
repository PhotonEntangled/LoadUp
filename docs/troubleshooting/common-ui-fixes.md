# Common UI Troubleshooting Fixes

## AccordionItem Ring Highlight Clipped (Tailwind/Shadcn)

**Symptoms:**
- Applying Tailwind `ring-*` utility classes (e.g., `ring-2 ring-primary`) to a Shadcn `AccordionItem` results in the visual ring effect being cut off or clipped, especially on the sides or corners.
- This often occurs when the `AccordionItem` is within a container that has padding or `overflow` properties set.

**Root Causes Investigated:**
1.  **Internal Padding on `AccordionItem`:** Applying padding directly to the `AccordionItem` (e.g., `p-2`) shrinks the box where the ring is drawn relative to the border, causing the ring to be inside the padding area and appear clipped against the item's own background/border.
2.  **Ring Offset and Parent Clipping:** Using `ring-offset-*` pushes the ring *outside* the element's border. If the parent container has padding (e.g., `pr-2`) or an `overflow` property (like `overflow-y-auto` which can sometimes affect x-axis rendering), the offset ring can extend into the padded area or outside the parent's bounds, leading to clipping.

**Solutions:**
1.  **Remove Padding from `AccordionItem`:** Ensure padding is applied to the `AccordionTrigger` and `AccordionContent` for internal spacing, not the `AccordionItem` wrapper itself.
2.  **Use `ring-inset`:** Replace `ring-offset-*` classes with `ring-inset`. This draws the ring *inside* the element's border/padding box, preventing it from being clipped by the parent container. This is often the cleanest solution if the visual change is acceptable.
   ```tsx
   // Before (Offset, might clip)
   <AccordionItem className={cn("border", isSelected ? "ring-2 ring-primary ring-offset-background ring-offset-1" : "")}>...</AccordionItem>

   // After (Inset, avoids clipping)
   <AccordionItem className={cn("border", isSelected ? "ring-2 ring-primary ring-inset" : "")}>...</AccordionItem>
   ```
3.  **Adjust Parent Padding/Overflow:** (Use with caution) If the offset ring is strictly required, remove or adjust the padding/overflow properties on the parent container to provide enough space for the ring. This can have wider layout implications.

**Context:** This issue was specifically resolved in `app/simulation/[documentId]/page.tsx` by switching to `ring-inset` after confirming that internal padding was not the primary cause. 