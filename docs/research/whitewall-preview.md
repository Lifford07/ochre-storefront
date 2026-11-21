# WhiteWall photo-print preview

Studied 21 November 2026 as a visitor, on a phone-sized Chrome window (412 × 900). Nothing here is their code, copy, or pictures. Ochré does not use their files.

## What was opened

1. `https://www.whitewall.com/uk/acrylic-prints/glossy-photo-print` — the glossy acrylic product page.
2. The button **Try configurator with sample image**. That navigates, without a file upload, to:

`/uk/configurator?product=item-acrylglasversieglung&formatType=FORMAT_4_TO_3&orientation=LANDSCAPE&artworkId=21&sizeStep=STEP_4`

The product in that URL is their photo print under acrylic glass (glossy, 2 mm in the sidebar). A separate “real glass” (soda-lime) line did not appear in the UK sitemap or the homepage links. On this site, glass means acrylic glass.

The storefront is an Angular app (the root element reports `ng-version` 21) with server-rendered HTML. The configurator is a lazy route, not part of the first product-page paint.

## How the live preview is made

It is a **client-side WebGL2 scene**, not a flat CSS frame and not a new server image on every click.

After the sample configurator opened:

- Two `<canvas>` elements, both with a `WebGL2RenderingContext`. On this viewport the larger was 500 × 268 pixels and the smaller 125 × 203.
- The scene is a custom element, `ww-display-picture-scene`, inside `ww-configurator`.
- The scene is assembled from glTF models and EXR lighting on `swap-assets.whitewall.com`, for example:
  - `component/image-cover/acryl-glossy/model.glb` (the glossy acrylic cover)
  - `component/image/paper-glossy/model.glb`
  - `component/backplate/25/model.glb`
  - `component/hanging-hardware/66/model.glb` (about 426 KB)
  - `component/room/wall/wallpaper/model.glb`, `room/floor/wood`, `room/ceiling/white`, `room/baseboard`
  - `environment/equirectangular-exr/reflect/map.exr`, plus `main`, `metal`, and `passepartout` maps (about 100–250 KB each)
  - `texture/configurator-background.jpg` (about 88 KB)
  - `rooms/30x20/raum.jpg` (a room plate)
- The photograph itself comes from `imageserver.whitewall.com` as one JPEG, about 766 KB in this session:

`/imageserver/image/view?id=…&type=12&pcEnabled=on&pcStrength=70`

`pcStrength=70` matches the sidebar, which showed image optimisation at 70%. So the **texture** can be prepared on their image server. The **object** (thickness, gloss, frame, room) is drawn in WebGL from the models and the EXR reflections. Changing the acrylic cover would swap the `acryl-glossy` model, not download a new mock-up photograph of the whole scene.

Product options (paper, size, frame, hardware) come from `api.whitewall.com/jsonApi/product/configure` (about 110–480 ms in this session) and `backend.whitewall.com/jsonApi/artwork/list`.

## What is not the live preview

- **Contentful** (`images.ctfassets.net`) serves the marketing photographs. Requests use `fm=webp` or `fm=avif`, plus `w` and `q`. Those are page images, about 9–16 KB for the small hero crops, and they are not the customer’s print.
- **SuperResolution, UltraHD, and image optimisation** are print enhancements. The sidebar showed SuperResolution and UltraHD as activated, and optimisation at 70%. That is an AI or processing step on the file, applied as parameters on the image-server texture. It is not how the glass, the frame, or the room are drawn.
- Analytics and consent (Kameleoon, Clarity, Sentry, Usercentrics, Trusted Shops) are not part of the picture.

## What makes it feel seamless

- The preview is the page. There is no second crop panel and no “show the preview” button. The scene is already there, and the options are a sidebar: size and crop, frame, acrylic thickness and gloss, paper, hanging hardware.
- Once the models and the texture have loaded, the scene is resident. A size or material change does not navigate to a new document. In this headless pass the size control was a disclosure (“60 × 45 cm”), not a row of buttons, so a size-swap was not clicked. The canvases and the assets were already loaded, which is the mechanism for an instant update.
- Scale is in centimetres on the object (“60 × 45 cm”) inside a room whose camera is close to the wall, so the print is large on a phone without ceasing to be a real size.
- Gloss is a material: an acrylic cover mesh plus reflection EXRs, not a flat white gradient on a photograph.
- The room is optional geometry (wall, floor, ceiling, rail), not a second page.
- On a phone the scene sits above the options. The price and “Add to cart” stay in reach.

The cost of that seamlessness is weight. The configurator chunk plus the glTF/EXR set was on the order of a couple of megabytes before the 766 KB texture. That is the wrong weight for Ochré’s phone budget.

## What Ochré should take, and not take

Take the behaviour: one client-side scene, the customer’s own pixels, instant repaint when size or material changes, true relative centimetres, a glass or acrylic edge and a reflection, a gold sheen for leaf, and an optional wall at the same scale.

Do not take their models, EXRs, room photographs, image server, layout, or words. Ochré draws the same kind of scene on one canvas, in the page, with no 3D library.
