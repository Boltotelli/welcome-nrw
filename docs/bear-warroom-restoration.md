# Restore the established Bear Warroom surface

The leadership release branch lacked the modern Bear stylesheet and landing markup that existed on `main`. A full production deployment therefore restored the older blue landing, despite correctly applying the requested mode-button change.

Restored the existing `warroom.css` and landing presentation from main commit `66a4bac756f316eefdc648a5530834b7aa7cbab5`, with its four-language copy. This is a targeted presentation restoration: the current calculation, profile and PIN handlers are retained. Advanced damage optimization remains first and gold; hero-only planning remains second and neutral.

The existing Kingshot bear artwork is now shipped as `bear/assets/warroom-bear.png`, using the unchanged bytes from `https://got-global-wiki.s3.us-west-1.amazonaws.com/wp-content/uploads/2026/01/jump_icon_40088.png`. The Pages artifact explicitly includes it. The HTML and publisher check reference the restored UI revision.

Regression coverage now checks the Warroom landing structure, actual charcoal background, decoded brand/art images, all four landing headlines and absence of the old Screenshot-Marathon headline. It also exercises both modes and their gold/neutral treatments on mobile. Publisher assertions require the Warroom stylesheet and markup, so a button-only check cannot overlook a design regression again.
