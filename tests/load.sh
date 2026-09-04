#!/bin/bash
# تست فشار ساده بدون نیاز به نصب چیزی.
# اگر k6 نصب باشد، tests/load.js دقیق‌تر است.
URL="${1:-http://localhost:3000/}"
N="${2:-400}"      # تعداد کل درخواست
C="${3:-50}"       # چند تا هم‌زمان
echo "تست: $N درخواست، $C تا هم‌زمان → $URL"
start=$(python3 -c 'import time;print(time.time())')
seq 1 "$N" | xargs -P "$C" -I{} curl -s -o /dev/null -w "%{http_code} %{time_total}\n" "$URL" > /tmp/mg-load.txt
end=$(python3 -c 'import time;print(time.time())')
python3 - "$start" "$end" <<'PY'
import sys
start,end=float(sys.argv[1]),float(sys.argv[2])
times=[];codes={}
for line in open('/tmp/mg-load.txt'):
    c,t=line.split(); codes[c]=codes.get(c,0)+1; times.append(float(t))
times.sort()
n=len(times); dur=end-start
p=lambda q:times[min(int(n*q),n-1)]
print(f"  کل زمان    : {dur:.2f} ثانیه")
print(f"  درخواست/ثانیه: {n/dur:.0f}")
print(f"  میانه (p50) : {p(.50)*1000:.0f} میلی‌ثانیه")
print(f"  p95         : {p(.95)*1000:.0f} میلی‌ثانیه")
print(f"  بدترین      : {times[-1]*1000:.0f} میلی‌ثانیه")
print(f"  کدها        : {codes}")
ok = codes.get('200',0)
print(f"  {'✓ همه موفق' if ok==n else '✗ ' + str(n-ok) + ' خطا'}")
PY
