# sparky_wall_pair_joy v1 — rigged animation draft

16 numbered transparent512×512 straight-alpha sRGB PNGs. Exact2048×2048 runtime atlas with4×4 cells; separate labeled contact sheet; transparent APNG; temporary-wall APNG/GIF/24fps MP4;100px review preview; measured manifest and export checks.

Neutral000 and015 are pixel-identical to the approved wall-idle000. Hips/seat and upper legs are fixed. The same wand, grip and star remain still. Free palm rises modestly below the shoulder. Only small local eye widening, brow lift, smile widening, chest lift and a late1.5px/0.7px shoe swing accompany it. The flame outline stays still. No effects or wall appear in runtime frames.

PEAK007, HAPPY_HOLD008, recovery009, neutral handoff015. This is a one-shot. Use the same action for either player finding a pair; the matching actor retains the turn. Holding008 briefly is optional, then play recovery. Pause freezes, Home cancels. Safe completed handoffs000/015.

Coordinates are top-left and frame-local. seatAnchor(256,300) is inherited authored registration, not inferred anatomy. mouthAnchor is the measured neutral smile-centroid pivot and stays fixed; current measuredSmileCentroid is separately reported as its curved artwork subtly widens. Grip, attached gold-star center, free glove and shoe positions are measured from exported color-feature pixels. wandTip is the gold-star center used as a prop/spawn reference, not a travelling-star asset.

Construction uses the built-in image-generation tool for one local palm/sleeve key, then preserves the original face/body/prop pixels with a local raster rig. The exact prompt, source references, local key and export code are included. This is not16 independently hand-drawn poses and is not claimed as production-approved. Palm opening/closing transitions and local sleeve interpolation still require animator review, especially005/010/011. The preview uses a temporary cream wall, not the actual game screen; game integration is untested.
