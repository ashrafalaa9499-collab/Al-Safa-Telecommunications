#!/bin/sh
[ -n "$SUPABASE_URL" ] && printf 'window.SB_CONFIG={url:"%s",key:"%s"};\n' "$SUPABASE_URL" "$SUPABASE_ANON_KEY" > js/config.js
exit 0
