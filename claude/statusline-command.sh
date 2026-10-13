#!/bin/bash
# Claude Code status line
# Shows: model, effort, context used %, 5h rate limit remaining, 7d rate limit remaining
# Requires: jq

input=$(cat)

DIM="\033[2m"
RESET="\033[0m"
CYAN="\033[36m"
YELLOW="\033[33m"
MAGENTA="\033[35m"

IFS=$'\037' read -r model effort ctx_used five_hour_used five_hour_resets seven_day_used seven_day_resets < <(
  echo "$input" | jq -r '[
    .model.display_name,
    .effort.level,
    .context_window.used_percentage,
    .rate_limits.five_hour.used_percentage,
    .rate_limits.five_hour.resets_at,
    .rate_limits.seven_day.used_percentage,
    .rate_limits.seven_day.resets_at
  ] | map(. // "" | tostring) | join("\u001f")'
)

now=$(date +%s)

parts=()

segment=""
if [ -n "$model" ]; then
  segment="$(printf "${DIM}${CYAN}%s${RESET}" "$model")"
fi

if [ -n "$effort" ]; then
  effort_str="$(printf "${DIM}${CYAN}%s${RESET}" "$effort")"
  if [ -n "$segment" ]; then
    segment="${segment} ${effort_str}"
  else
    segment="$effort_str"
  fi
fi

if [ -n "$segment" ]; then
  parts+=("$segment")
fi

if [ -n "$ctx_used" ]; then
  parts+=("$(printf "${DIM}ctx:${RESET} ${YELLOW}%.0f%%${RESET}" "$ctx_used")")
fi

if [ -n "$five_hour_used" ]; then
  five_remaining=$(awk -v u="$five_hour_used" 'BEGIN{r=100-u; if(r<0)r=0; if(r>100)r=100; printf "%.0f", r}')
  five_str="$(printf "${DIM}5h:${RESET} ${MAGENTA}%s%%${RESET}" "$five_remaining")"
  if [ -n "$five_hour_resets" ]; then
    five_ideal=$(awk -v now="$now" -v resets="$five_hour_resets" -v total=18000 'BEGIN{i=(resets-now)/total*100; if(i<0)i=0; if(i>100)i=100; printf "%.0f", i}')
    five_reset_time=$(date -d "@$five_hour_resets" +%H:%M 2>/dev/null || date -r "$five_hour_resets" +%H:%M 2>/dev/null)
    five_str="${five_str}$(printf " ${DIM}(ideal %s%%, reset %s)${RESET}" "$five_ideal" "$five_reset_time")"
  fi
  parts+=("$five_str")
fi

if [ -n "$seven_day_used" ]; then
  seven_remaining=$(awk -v u="$seven_day_used" 'BEGIN{r=100-u; if(r<0)r=0; if(r>100)r=100; printf "%.0f", r}')
  seven_str="$(printf "${DIM}7d:${RESET} ${MAGENTA}%s%%${RESET}" "$seven_remaining")"
  if [ -n "$seven_day_resets" ]; then
    seven_ideal=$(awk -v now="$now" -v resets="$seven_day_resets" -v total=604800 'BEGIN{i=(resets-now)/total*100; if(i<0)i=0; if(i>100)i=100; printf "%.0f", i}')
    seven_str="${seven_str}$(printf " ${DIM}(ideal %s%%)${RESET}" "$seven_ideal")"
  fi
  parts+=("$seven_str")
fi

sep=" ${DIM}|${RESET} "
output=""
first=1
for part in "${parts[@]}"; do
  if [ "$first" -eq 1 ]; then
    output="$part"
    first=0
  else
    output="${output}${sep}${part}"
  fi
done

printf "%b\n" "$output"
