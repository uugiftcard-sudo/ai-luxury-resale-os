# CLOTH — OpenClaw Heartbeat

This file drives the autonomous operating loop. OpenClaw reads this on every heartbeat tick.

## Philosophy
CLOTH runs as a **founder-machine partnership**: the AI handles every safe, repeatable, compliant task autonomously. The founder reviews, approves, or overrides escalations. The goal is full automation of safe operations, with zero autonomous decisions on risky ones.

---

## Morning Loop (06:00–09:00 local time)

**Trigger**: Heartbeat fires at 07:00 local time.

**Steps**:
1. **Read system state** — Run `npm run demo` (or import services directly) to get:
   - Control center snapshot for UK and HK
   - Products missing proof packs (action queue)
   - Orders in fulfilment queue
   - Sourcing lead scores
   - CRM escalation queue

2. **CEO daily brief** — Produce the Daily Battle Plan:
   ```
   ## Today's Battle Plan — [DATE]
   
   Market Focus: [UK / HK / BOTH]
   
   Priority Actions:
   1. [Action] — [Reason]
   2. ...
   
   Watch Items:
   - [Product/order/risk to monitor]
   
   Escalations Needing Approval:
   - [List any escalated items from overnight]
   ```

3. **Proof pack check** — Flag any product that has been purchased but has no proof pack. Assign creation task.

4. **Sourcing review** — Score any new sourcing leads collected overnight. If any score BUY, flag for founder purchase approval.

5. **Overnight escalations** — Review any CRM tasks escalated overnight. Draft responses for founder to approve.

6. **Output**: Post battle plan summary to founder (e.g., console output, note, or Slack/WhatsApp message).

---

## Afternoon Loop (12:00–14:00 local time)

**Trigger**: Heartbeat fires at 13:00 local time.

**Steps**:
1. **Fulfilment check** — Are there paid orders waiting to be dispatched?
   - UK: pack + video + weigh + ship tracked
   - HK: confirm FPS → pack + video + SF or arrange face-to-face

2. **Listing check** — Any proof-ready products not yet listed? Generate and post.

3. **Community engagement** — Execute daily community plan:
   - HK: Carousell replies, WhatsApp VIP drop
   - UK: TikTok warm-up, eBay offer review

4. **Content pipeline** — Run video factory on any new listings today. Generate hooks, captions, shot lists.

5. **Live prep** — If live session is scheduled today, run the full run-of-show checklist (before-live steps).

---

## Evening Loop (19:00–21:00 local time)

**Trigger**: Heartbeat fires at 20:00 local time.

**Steps**:
1. **Live session** — If live is running:
   - Monitor during-live steps
   - Post live as it happens (countdown reminders, product reveal sequence)
   - After live: run after-live checklist, generate thank-you message, schedule follow-ups

2. **End-of-day wrap**:
   - Did all dispatch happen today?
   - Any buyer messages unanswered?
   - New inbound sourcing leads?
   - Update QUEUE.md with today's completions

3. **Revenue snapshot**:
   - Revenue today: orders dispatched × price
   - Fulfilment cost: shipping + platform fees
   - Estimated profit: revenue − cost − fees − refund reserve
   - Post to founder

4. **Tomorrow prep**:
   - Queue tomorrow's first actions
   - Flag any overnight risk items

---

## Risk Escalation (on-demand, any time)

**Trigger**: CRM task with `requiresApproval: true` arrives, or agent flags escalation.

**Response**:
1. Alert founder immediately (do not wait for next heartbeat)
2. Include: full context, product/order details, recommended action, any deadlines
3. Pause autonomous action on this item until founder responds
4. Log escalation in QUEUE.md

---

## Anti-Loop Guard

If the same task appears in the queue more than 3 times without resolution, flag it as a **system blocker** and alert founder. Common blockers:
- Missing API credentials (Shopify, TikTok tokens not in `.env`)
- No proof pack for listed product (system inconsistency)
- Repeatedly escalating same buyer (may need block-list)
- Live session in `pre_live` phase for >48h without going live (stale session)

---

## Heartbeat Configuration

```yaml
# .openclaw/openclaw.yml (or configured externally)
cron: "0 7,13,20 * * *"   # 07:00, 13:00, 20:00 local time
timezone: "Europe/London"   # founder sets their timezone
notify_on_output: true     # alert founder on escalation
```

The founder's timezone should be set to their actual location (UK = Europe/London, HK = Asia/Hong_Kong).
