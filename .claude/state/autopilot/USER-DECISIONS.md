# Questions for you

Autopilot parks these because they need a migration, a brand choice or a new dependency. Answer any
of them in a normal message; the loop keeps working on everything else meanwhile.

1. **Password reset can be abused (round 1, SEC-01, High).** Today anyone who knows an employee's
   email can ask for a reset with a password they chose, and one tap on Approve under Team makes it
   real.
   - A. The request carries no password. The owner approves by setting a temporary password and
     telling the person (uses the existing "Set password"). Needs a small migration. **Recommended.**
   - B. Keep the flow; only add a warning on the Approve dialog ("approve only if they asked you in
     person"). No migration, weaker.
   - C. Leave as is.

2. **White text on the orange buttons is hard to read in light mode (round 1, A11Y-02).** Contrast is
   3.56:1; the accessibility minimum for this text size is 4.5:1.
   - A. Darken the light-mode button orange to about `#C2410C` (5.2:1); dark mode keeps `#F97316`.
     **Recommended.**
   - B. Keep `#EA580C` and make button labels bolder and slightly larger.
   - C. Leave as is.

3. **Offline selling stops working once the app is closed (round 1, PWA-01).** Queued sales survive a
   restart, but the item list does not, so a shop that opens the app with no connection has nothing
   to sell from.
   - A. Add `@tanstack/react-query-persist-client` and keep the item list on the device for the
     signed-in account (cleared on sign-out). **Recommended.**
   - B. Keep it as is and change the sign-in line "Keeps selling offline" to say the app must already
     be open.
   - C. Leave as is.

4. **Sign-in and sign-up have no limits (round 1, SEC-02).** Passwords can be guessed without a
   lockout, sign-ups can flood the owner's notifications, and the reset form tells a stranger whether
   an email has an account.
   - A. One migration: lock an email for a few minutes after 5 wrong passwords, cap pending sign-ups
     per hour, and give the reset form the same answer either way. **Recommended.**
   - B. Only the lockout.
   - C. Leave until the SaaS build.
