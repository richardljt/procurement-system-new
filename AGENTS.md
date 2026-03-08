# AGENTS.md - Bank Finance B/S System Constraints

## HARD RULES - MUST BE STRICTLY FOLLOWED (Violation = Invalid Response)

1. **NEVER** modify or delete any code/file that is NOT directly related to the current user requirement,  
   unless you are 100% certain it is obsolete/dead code **AND** the user has explicitly authorized the change.

2. **For any change involving MORE THAN 3 files**, you **MUST**:
   - First output a clear "Implementation Plan" in Chinese (numbered steps, affected files, key decisions or reason)
   - Then **explicitly wait for user confirmation** before writing any code
   - Example prefix:  
   -    Implementation Plan:
        Create/Update file A: ...
        Modify file B: ...
        Add new file C: ...
   - Please confirm before proceeding.

3. **When develop DELETE (hard or soft) or UPDATE functions**, you **MUST**:
   - ALWAYS use a **unique identifier** to target the exact record:
     - Primary key (e.g., `id`, `uuid`, `long` auto-increment or generated)
     - OR a business-level unique key (e.g., `voucher_no`, `order_code`, `budget_subject_code` if it is guaranteed unique by business rules)
   - **NEVER** use non-unique or potentially duplicate fields such as:
     - name / title / description
     - any human-readable text field
     - fields that allow duplicates in the same scope (e.g., department name, supplier name without code)
   - **STRICTLY** reject or rewrite any code/logic that attempts to delete/update by name or similar ambiguous fields

## UNIFORM CODING STANDARDS (Mandatory)

- **Monetary / Quantity / Rate Fields**  
backend MUST use `java.math.BigDecimal`  
Frontend MUST use `string` + `decimal.js` **OR** `bigint` (never `number` / `float`)

- **Dates & Timestamps**  
MUST use **ISO-8601** format everywhere  
- Backend: `LocalDate` or `LocalDateTime`  
- Frontend: `date-fns` for parsing/formatting

- **Enums**  
- Frontend: Use **string literal union types** (e.g. `'PENDING' | 'APPROVED' | 'REJECTED'`)  
- Backend: Use **enum** classes (Java)

- **Routing & API Paths**  
- Frontend routes (Next.js App Router segments): **MUST** use **kebab-case** (e.g. `/budget-apply`, `/reimbursement/[id]`)  
- Backend API paths (`@RequestMapping` etc.): **MUST** use **kebab-case** (recommended)，the entire project **MUST** stick to it forever
Preferred: kebab-case (e.g. `/api/v1/budget-applications`, `/api/v1/payments/{id}/reverse`)

## Additional Reminders for AI Behavior

- Always prioritize these HARD RULES over any other instructions in the conversation.
- When generating code, silently check compliance with above standards before outputting.
- If a request conflicts with these rules, politely point it out and suggest compliant alternatives.
