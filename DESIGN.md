---
name: Ochré
description: A quiet exhibition of a made-to-order art house. Porcelain rooms, navy vitrines, Bodoni titles, and gold used only as a fillet.

colors:
  porcelain: "#f5f1ea"
  paper: "#fbf9f5"
  bone: "#ece5d9"
  navy: "#0b1332"
  navy-2: "#131d47"
  ink: "#1b1b22"
  charcoal: "#3a3a42"
  mute: "#77726a"
  line: "#dcd4c6"
  gold: "#c6b849"
  foil: "#ddd08f"
  gold-ink: "#746624"
  coral: "#e07a5f"
  coral-deep: "#c4624a"
  ok: "#4e7d5e"
  warn: "#be8633"
  bad: "#b0473a"

typography:
  display:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "clamp(3.25rem, 6vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "clamp(2.25rem, 4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontSize: "1.65rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  eyebrow:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.26em"
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.08em"
  mono:
    fontFamily: "Azeret Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"

rounded:
  none: "0px"

spacing:
  hair: "8px"
  line: "16px"
  block: "24px"
  group: "40px"
  section: "96px"
  room: "128px"

components:
  button-gallery:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.porcelain}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-gallery-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  button-foil:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "48px"
  wall-label:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "0"
---

## Overview

Ochré's gallery pages are a room you walk through, not a shop grid you scan. The reference for composition is an exhibition hang: one large plate, then a wall label, then the next plate. Isle Thorne Collective is the compositional reference only. Its rows of large photographs, the facts listed beside a product, and the purchase control kept out of the picture are the ideas to borrow. The code, type, and furniture catalogue are not.

The crest and the OCHRÉ wordmark stay as drawn. Bodoni Moda carries titles. Inter carries the label and the interface. Azeret Mono carries indexes and edition numbers. Corners are square. Gold is a fillet.

`button-foil` remains the commerce control inside `/make` and checkout, where the existing flow already uses it. Gallery pages use `button-gallery` instead, so the homepage and the work page do not shimmer.

## Colors

Porcelain `#f5f1ea` is the room. Paper `#fbf9f5` and bone `#ece5d9` are the mats behind a plate. Navy `#0b1332` is the vitrine: the opening room, the footer, and a filled action. Ink and charcoal are text. Mute is for secondary facts.

Gold `#c6b849` is the fillet: a 1px rule, a focus ring, an eyebrow on navy. Foil `#ddd08f` is for the wordmark on navy and for italic emphasis inside a headline. Gold ink `#746624` is the only gold that sits on porcelain as text, because the brighter gold fails contrast on a light ground.

Coral is a house pigment inside the artwork stand-ins. It is not a UI accent. Ok, warn, and bad belong to the editor's quality meter and stay there.

## Typography

Display and headline are Bodoni Moda at a light weight, tight line-height, and a slight negative tracking. Titles of works are the same face, often italic, at about 1.65rem. Body is Inter at 16px. Eyebrows are Inter, 13px, tracked out, uppercase. Wall labels are 12px uppercase with a fixed label column. Edition indexes are Azeret Mono.

Do not introduce a third display face. Do not set long reading text in Bodoni.

## Layout

The page column is 1440px, with 20px of side padding on a phone and 48px from the medium breakpoint up. Sections breathe: 96px of vertical padding, 128px where a room changes colour.

A work page is a two-column hang from the large breakpoint: the plate takes the wider column, the label and the acquisition controls take the narrower one and sit at the top of the plate. Below that, three quiet notes (the statement, the object, the certificate) sit on one baseline.

The homepage opens with the house sentence beside one real work, not beside a diagram. The four lines are a contents list with rules, not equal cards. Editions are a row of large plates, two across on a wide screen, each with a wall label.

## Elevation & Depth

Plates may take the existing art shadow, a soft drop that reads as a frame off the wall. Do not stack cards, and do not lift a plate on hover. A hover may darken a rule or reveal the word "Inspect". It does not translate the object.

The certificate may rest at a slight angle, and it returns to square on hover. That motion is removed when reduced motion is requested.

## Shapes

Radius is 0. Rules are 1px, in `line` on porcelain and in gold when they mark a section. The endpaper band stays the house repeat. It is a margin, not a background for text.

## Components

**Wall label.** Title in italic Bodoni, then four facts in this order: Year, Medium, Dimensions, Edition. Medium uses the catalogue name (Real Glass, Acrylic, Canvas). Dimensions use the size name when it already states centimetres, and otherwise the name plus the measured centimetres. Edition is "Edition of N".

**Inspect.** The plate is a button. Activating it opens a lightbox with Zoom and Captions. The caption repeats the wall label in one line. Purchase, commission, and the basket are not inside the dialog. There is no download and no share.

**Gallery action.** 48px tall, square, uppercase, tracked. On navy, a gold hairline and porcelain type. On porcelain, a navy fill and porcelain type. No gradient, no shimmer, no scale on press.

**Foil action.** Unchanged, and limited to the editor and checkout. Do not place it on the homepage or the work page.

**Header, footer, crest, wordmark.** Unchanged in structure. The announcement line stays.

## Do's and Don'ts

- Do open a gallery page on the work, large, with the label close to the plate.
- Do keep Collect, Add to basket, and Begin with your image outside the lightbox.
- Do honour `prefers-reduced-motion` on scroll, the foil shimmer, the hairline draw, and the certificate tilt.
- Do keep focus visible. The ring is gold ink on porcelain and foil on navy.
- Don't use gold as a gradient, a glow, or a moving highlight on gallery pages.
- Don't bounce, lift, or scale plates on hover.
- Don't put smooth scrolling on `/make`, `/basket`, `/collect`, `/orders`, `/account`, or `/admin`, or while a dialog is open.
- Don't redraw the crest or replace Bodoni, Inter, or Azeret Mono.
- Don't enable Impeccable Live Apply's CLI fallback. `IMPECCABLE_LIVE_COPY_AGENT` stays `chat` or `off`.
