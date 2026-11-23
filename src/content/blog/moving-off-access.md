---
title: Moving calibration records off an Access database
description: "Lessons from moving a calibration lab's records off a decade-old Access database: messy data, hidden rules and checking nothing went missing."
publishDate: 2026-12-01
draft: true
---

If your calibration lab still runs on an Access database, a spreadsheet or a system someone built years ago, you're not alone. Moving off it feels risky, because those records are the lab's history. This is what I learned moving one NATA-accredited lab's records into a new system, and what I'd tell you to plan for.

## Signs it's time to move

For over ten years, the lab I work at ran on a Microsoft Access database. These were the signs it had stopped keeping up:

- **No checks at the bench.** Technicians recorded readings on paper worksheets, with no live tolerance or pass/fail check. Office staff then re-keyed those readings into the certificate.
- **Certificates built by hand.** Office staff picked a Word template for each certificate, and picking the wrong one was a constant source of errors.
- **Categories as free text.** Instrument categories were typed in as text, so the same thing could be spelt several ways, which made searching and reporting unreliable.
- **History spread everywhere.** Tracing an instrument's history meant searching across the database, Word documents and shared folders.
- **No proper revision trail.** Correcting an issued certificate meant saving a new file, not linking it to the one it replaced.

If you recognise more than one of these, the problem isn't going away on its own.

## What to plan before you migrate

### Expect messy data

The hardest part wasn't the new system. It was the old data. Specifications and ranges had been typed in freely for years, mixing formats and units:

- `-100 to 0`
- `0-100`
- `40000 kPa`
- `>63mm`
- `0 to -100 +0 +1000kPa`

Every one of these had to be turned into structured data, with proper categories, instrument types, units and specifications, before it could go into the new system. Cleaning it up by hand took a long time, and it had to happen before the migration, not after.

### Decide what to keep, clean and leave behind

- **Keep:** active customer accounts, equipment registers and past calibration records.
- **Clean:** free-text categories, units and specifications, mapped into a consistent format before import.
- **Leave behind:** text-based category logic, the Word certificate templates and the paper worksheets.

New certificates now live in the app, stored against each instrument, instead of in separate folders.

### Check nothing went missing

I built the migration so it could do a dry run first, reporting record counts and any mapping errors before anything was saved. After the real import, I spot-checked customers and instruments by hand and cross-checked the totals in Excel. The old system stayed available alongside the new one while I checked.

### Involve the people who'll use it

Office staff tried the new system in a usability test before go-live. Their feedback was clear: bulk worksheet creation, instead of creating worksheets one by one, will save them a lot of time.

## What I learned moving over 2,900 instrument records

In the end, the migration moved over 2,900 instrument records (2,108 pressure and 806 torque, including archived equipment) and 394 past worksheets out of text-based categories into a structured database. A few things stood out.

**A lot of the logic lived in people's heads.** Which reference equipment suits which range, or the tolerance rules for each instrument type, weren't in the old database. They lived with the technicians and on paper, and had to be written down before they could be built into the system.

**The specs were messier than they looked.** Free text looks fine in a list. It's only when you try to turn it into structured data that you see how many ways people have written the same thing.

**Was Power Platform the right first step?** I'm honestly not sure. Building quickly let me put worksheets in front of the lab early and learn a lot about real-world calibration, things I could never have worked out on my own. We got real value from the Model-Driven App, and we could have stayed on it, but it would have cost more over time. Moving off it meant a difficult conversation with stakeholders. It was a necessary one, and I didn't shy away from it once I'd built a working prototype in my own time to show them.

**Don't assume the data is clean.** Plan time to fix it before you move it.

You can read the full story of the rebuild in the [Calibration Software case study](/work/calibration-software/).

## Where to start

You don't need to choose new software this week. Start with what you already have:

1. **Make a copy of your data and look at it properly.** Count your instruments, list your categories, and note where the same thing has been typed different ways. That tells you how much clean-up is ahead.
2. **List everything your current system produces.** Certificates, worksheets, reports, due-date reminders: anything the new system has to do on day one.
3. **Write down the rules that live in people's heads.** Tolerances, which reference equipment goes with which range, and anything else your technicians just know.

Then decide between off-the-shelf and custom software. Off-the-shelf can be the right choice if your work fits how it's designed: you can start sooner and someone else maintains it. Custom makes sense when your instruments, workflow or certificates don't fit, or when you'd be paying for a lot you don't use. Either way, the clean-up and planning come first.
