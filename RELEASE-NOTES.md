## RELEASE NOTES
### Version 3.0.0-zeta
**EUI-3622** Re-tag of previous pre-release, following PR corrections

### Version 3.0.0-epsilon
**EUI-3622** Pre-release candidate modifying Case Data payload submission, following reinterpretation of "retain hidden value" semantics

### Version 3.0.0-delta
Incorporating fixes in Version 2.72.9-prerelease-fix-case-submission for EUI-3494 and EUI-3495

### Version 3.0.0-gamma
Incorporating fix in Version 2.72.6-fix-filter-any-state for EUI-3490

### Version 3.0.0-beta
Incorporating fix in Version 2.72.5-remove-null-http-request-headers for EUI-3464

### Version 3.0.0-alpha
**EUI-3038** Pre-release candidate fixing "retain hidden fields" functionality; fixes superfluous null value submission for empty fields

### Version 2.79.14-labels-not-displaying-case-heading
**EUI-2569** ExUI - Labels not displaying in Case Heading

### Version 2.79.13-Unresponsive-and-laggy-show-hide-conditions
**EUI-3870** ExUI - Unresponsive and 'laggy' show-hide conditions

### Version 2.79.12
**EUI-3682** Callback Error still not showing proper error message in XUI screen

### Version 2.79.10-input-type-accessibility
**EUI-2039** Changed Date Input fields to conform to accessibility standards

### Version 2.79.7
**EUI-3638** ExUI - Activity Tracker not shown on UI as expected by business
**EUI-2925** Review implementation of Activity tracker in MC Demo Int env

### Version 2.79.6
**EUI-3770** Hotfix for previous pages not populating default field values.

### Version 2.79.5
**EUI-3797** Hotfix for missing content in the Payment History tab.

### Version 2.79.4
**EUI-3708** Fix for case submission regression.
**EUI-3728** Fix for labels showing on tabs that should be hidden.

### Version 2.79.3-mandatory-organisation-hotfix
**EUI-3674** Add organisation policy MANDATORY validator check

### Version 2.79.2
**EUI-3587** Fix "Print URL" pipe for rewriting remote Print Service URLs to a "local" version for the front-end

### Version 2.79.1
**EUI-3452** Fix to some issues on the Check your answers page.

### 2.79.0
**EUI-3548** WA integration

### Version 2.75.1
**EUI-3577** Fixing DynamicList regression bugs

### Version 2.75.0
**EUI-3267** Reintroducing the grey bars for fields shown by other fields

### Version 2.73.2-collection-date-field
**EUI-2667** Fix to date field rendering within collections

### Version 2.74.2
**EUI-3594** Incorporating Version 2.73.0-hotfix-error-message-display from hotfix branch

### Version 2.74.1
**EUI-3506** Non-Descriptive Headings (AA) - issue 04

### Version 2.73.5-ngmodel-deprecation
**EUI-3410** ngModel deprecation

### Version 2.73.2-collection-date-field
**EUI-2667** Fix to date field rendering within collections

### Version 2.73.0-hotfix-error-message-display
**EUI-3594** Fix issue with error message specifics not being displayed

### Version 2.73.0
**EUI-3222** Loading spinner

### Version 2.72.9-fix-case-submission
**EUI-3494** Fixed the missing case ID on case creation.
**EUI-3495** Fixed an issue where the user was return to Case list following case creation.

### Version 2.72.6-fix-filter-any-state
**EUI-3490** Fixed an issue with the Case list filter where "Any" state is selected.

### Version 2.72.5-remove-null-http-request-headers
**EUI-3464** Fix Document field uploads by removing setting of null HTTP "Accept" and "Content-Type" headers

### Version 2.72.4-check-your-answers
Fix EUI-3452 - fix for show/hide conditions on Check Your Answers page.

### Version 2.72.3-dynamic-list-null-values
EUI-3045 Handle null values appropriately.

### Version 2.72.2
EUI-3045 performance enhancements and 3045 work

### Version 2.72.1-do-not-send-empty-documents
Fix EUI-3403 - fixed a subsequent issue with empty documents being sent.

### Version 2.72.0-task-event-completion
**EUI-3229** Task event completion - part 2

### Version 2.71.4-optional-top-level-documents
Fix EUI-3403 - fix for optional top-level documents incorrectly showing.

### Version 2.71.3-conditional-show-perf
Fix EUI-3398 - don't submit labels with empty string values 

### Version 2.71.2-conditional-show-perf
Fix EUI-3381 - fix for missing alert banner.

### Version 2.71.1-conditional-show-perf
Fix EUI-3375 - more tweaks to collections on data submission

### Version 2.71.0-conditional-show-perf
Release candidate for conditional show performance.

### Version 2.70.1-fix-alert-service
Fixes for case filtering.

### Version 2.70.0-fix-alert-service
Fix breaking changes of Alert Service

### Version 2.69.1-fix-replace-document-issue
**EUI-2243** Fix upload replacement document issue

### Version 2.69.0-color-contrast-aa
**EUI-2030** Change selected table row background colour to improve accessibility (AA)

### Version 2.68.16-prerelease-conditional-show-perf
EUI-3366 - CYA hide hidden fields
EUI-3284 - Form submission must include data in complex field values
EUI-3359 - Full stop in field names broke show hide

### Version 2.68.15-prerelease-conditional-show-perf
Don't submit labels if they are blank

### Version 2.68.14-prerelease-conditional-show-perf
**EUI-2830** Dynamic list fixes

### Version 2.68.13-prerelease-conditional-show-perf
We do need to submit labels

### Version 2.68.12-prerelease-conditional-show-perf
**EUI-3331** Problem with event_data submission

### Version 2.68.11-prerelease-conditional-show-perf
**EUI-3270** Improve performance of event forms. 
Work around for case when profile data is not available. 
Merge master to simplify final branch merge

### Version 2.68.10-prerelease-conditional-show-perf
**EUI-3168** fix regression issues and further improve performance

### Version 2.68.9-prerelease-conditional-show-perf
**EUI-3151** dynamic lists and nested complex in collection fixes

### Version 2.68.8-prerelease-conditional-show-perf
**EUI-3151** form validation and label fixes

### Version 2.68.7-prerelease-conditional-show-perf
**EUI-3151** Changes to make validation work properly and fix all the tests

### Version 2.68.6-prerelease-conditional-show-perf
**EUI-3151** Fix more problems caused by components not being registered. Fix problem with [hidden] not working inside inline template

### Version 2.68.5-prerelease-conditional-show-perf
**EUI-3151** Fix problems caused by components not being registered

### Version 2.68.4-prerelease-conditional-show-perf
**EUI-3151** Additional changes to fix probate regression during case creation

### Version 2.68.3-prerelease-conditional-show-perf
**EUI-3151** Fix probate regression during case creation

### Version 2.68.2-prerelease-conditional-show-perf
**EUI-3055** Fix regression in address field and tests

### Version 2.68.0-prerelease-conditional-show-perf
**EUI-3055** Better performance in edit forms through new show hide implementation

### Version 2.67.10-feature-toggle-work-allocation
**Feature Toggle Work Allocation** Hot Fix

### Version 2.67.6-task-event-completion
**EUI-2986** Task Event completion

### Version 2.67.9-ie-textbox-expand-issue
**EUI-2333** IE textbox expand issue

### Version 2.67.5-dynamiclist-fix-in-complex
**EUI-2350** Dynamic Lists in Complex Types

### Version 2.67.4-reset-button-and-keyboard-fix
**EUI-2989** GDS styles Checkbox: keyboard tab and spacebar not effective on Safari and Firefox
**EUI-2987** reset button not working on x-ui

### Version 2.67.3-tab-name-replaceAll
**EUI-3041** Use Tab names but use replaceAll

### Version 2.67.2-tab-name
**EUI-3041** Use Tab name instead of Index

### Version 2.67.1-focus-order
**EUI-2020** Accessibility amends for tabs and page load

### Version 2.67.0-performance-tabs
**EUI-2955** Improve performance time when loading by lazy loading

### Version 2.66.0
**EUI-2741** Improve performance time when loading a case with large hearing and judgement collections

### Version 2.65.8-media-viewer-hotfix
**EUI-2981** bug/EUI-2981-cannot-open-media-viewer-2

### Version 2.65.6
**EUI** bumping up

### Version 2.65.5
**EUI** bumping up

### Version 2.65.4-retain-hidden-fields-pre-release
**EUI-2739** Bump version number to trigger npm release process

### Version 2.65.3-retain-hidden-fields-pre-release
**EUI-2739** Fix "retain hidden fields" functionality for Complex collection, nested Complex, and nested Complex collection types

### Version 2.65.2-hidden-fields-revert
**EUI** Undoing retain hidden fields functionality

### Version 2.65.1
**EUI** Undoing retain hidden fields revert 

### Version 2.65
**EUI** Catching up with releases

### Version 2.64.52-collection-permission
**EUI-1370** UI When using case role collection of complex types doesn't seem to work

### Version 2.64.50-case-share-hot-fix
* correct and cherry-pick the right commits

### Version 2.64.49-retain-hidden-value-complex-and-collection-types-fix
**EUI-2739** Fix "retain hidden fields" functionality for all field types, including Complex and Collection types

### Version 2.64.48-case-share-hot-fix
* determine whether a case sharable by supplementary_data

### Version 2.64.47-case-share-hot-fix
* variant base on 2.64.41-reinstate-EUI-2575
* add hot fix for case share for retaining case role

### Version 2.64.46-caselist-selected-check
**EUI-2740** Fix bug for the caselist check

### Version 2.64.45-caselist-selected-check
**EUI-2681** Fix bug for the caselist check

### Version 2.64.44-retain-hidden-value-fix-for-complex-types
**EUI-2681** Fix bug with check for complex field types

### Version 2.64.43-retain-hidden-value-fix-for-complex-types
**EUI-2681** Fix: Do not set a field control's value to `null` if it corresponds to a complex `CaseField` type

### Version 2.64.42-retain-hidden-value-support
**EUI-1783** Delete hidden field value except if `retain_hidden_value` flag is true

### Version 2.64.41-reinstate-EUI-2575
**EUI-2657** - Reinstate EUI-2575 (`use_case` query param), in line with the reversion in CCD Demo environment being undone

### Version 2.64.40-unasinged-cases-date-format
**EUI-2590** - unassinged-cases list date format

### Version 2.64.39-fix-datepipe-error
**EUI-2649** - EUI-2649-case-detail-is-broken

### Version 2.64.38-revert-EUI-2575
**EUI-2649** - Revert EUI-2575 (which changed `usecase` query param to `use_case`), due to reversion in CCD Demo environment

### Version 2.64.37-organisation-complex-field-type
**EUI-2087** - Search organisation support full UK address fields

### Version 2.64.36-hide-generic-callback-error-message
**EUI-2344** - Hide generic callback error message when there is a custom configured message provided by a Service

### Version 2.64.35-organisation-complex-field-type
**EUI-2086** - Search organisation
**EUI-2087** - Select organisation
**EUI-2089** - Save organisation

### Version 2.64.34-utc-local-date-fix
**EUI-1844** - Changed UTC to Local date view in event log

### Version 2.64.33-internal-search-api-url-update
**EUI-2575** - Update query param in Internal Search API URL from `usecase` to `use_case` (see RDM-8932)

### Version 2.64.32-org-service-handle-error
**EUI-2086** - unhappy path

### Version 2.64.31-mv-upgrade-prerelease - September 9 2020
**EUI-2370** - added case jurisdiction to media viewer controller

### Version 2.64.30-cacheable-org-service - Sept 8 2020
**EUI-2229** - cacheable organisation Service

### Version 2.64.29-case-list-selection - September 4 2020
**EUI-2103** - case selection

### Version 2.64.28-case-list-component-reset-sel-cases - September 2 2020
**EUI-2168** - reset selected cases on model change

### Version 2.64.27-mv-upgrade-prerelease - September 2 2020
**EUI-2370** - fixing previous release

### Version 2.64.26-mv-upgrade-prerelease - September 2 2020
**EUI-2370** - passed case id into media viewer

### Version 2.64.25-case-sharing-prerelease - August 27 2020
**EUI-2532** - removed org-policy dependency when sharing a case

### Version 2.64.24-case-sharing-prerelease - August 24 2020
**EUI-2500** - type.type instead of type.id

### Version 2.64.22-consumer-sorting-prerelease - August 17 2020
**EUI-1731** - Fix for sort behaviour - passing type

### Version 2.64.21-case-sharing-prerelease - August 11 2020
**EUI-2186** - Disabled case share selection if no organisation policy

### Version 2.64.20-consumer-sorting - August 06 2020
**EUI-1731** - Sort Behaviour in Manage Cases - Task 3

### Version 2.64.19-security-fix - July 31 2020
**EUI-2115** - CaseListComponent - Dependency updates to fix security vulnerabilities

### Version 2.64.14-security-fix - July 29 2020
**EUI-2115** - CaseListComponent

### Version 2.64.13-security-fix - July 29 2020
**EUI-2115** - CaseListComponent

### Version 2.64.12-case-sharing-prerelease - July 28 2020
**EUI-2115** - CaseListComponent

### Version 2.64.10-elastic-search-prerelease - July 23 2020
**EUI-1753** - Elastic Search Endpoint

### Version 2.64.6-case-sharing-prerelease - June 30 2020
**EUI-2185** - Reset case selection link shows for other jurisdictions eg: Probate. Fixed.

### Version 2.64.5-case-sharing-prerelease - June 23 2020
**EUI-1938** - Only available to professional users - Case list selection - MC
**EUI-2101** - Share case styling issue


### Version 2.64.4-EUI-1940-prerelease - March 3 2020
**EUI-1940** - Case list selection for sharing a case

### Version 2.64.3-EUI-1610-prerelease - March 3 2020
**EUI-1610** - Importing rx-polling from npmjs rather than github

### Version 2.64.2-EUI-1610-prerelease - March 2 2020
**EUI-1610** - Changed import strategy for rx-polling
**EUI-1476** - Continued activity logging when browser inactive

### Version 2.64.0-prerelease - January 30 2020
***CCD-17.1**

### Version 2.63.1-RDM-6719-prerelease - January 6 2020
***RDM-6719** Add Banner Feature to CCD UI
2.64.0-prerelease

### Version 2.63.0 - December 18 2019
release from master branch

### Version 2.63.0-RDM-5875-paydemo
**RDM-6635** - Bulk scanning transaction page integration into CCD web component

### Version 2.62.29-RDM-6887-prerelease - December 17 2019
***RDM-6887** Remove duplicate display context from data store endpoint

### Version 2.62.28-RDM-6061-prerelease - December 17 2019
**RDM-6061** - JS error when a non-available case field is used in showCondition

### Version 2.62.26-RDM-6716-prerelease - December 17 2019 
**RDM-6716** default '--select a value--' bug fix for fixed list 

### Version 2.62.27-RDM-6555-prerelease - December 12 2019
***RDM-6555** Address Current known security vulnerabilities in ccd-case-ui-toolkit

### Version 2.62.25-RDM-5007-prerelease - December 10 2019
**RDM-5007** CaseField must be READONLY if user has no UPDATE rights

### Version 2.62.24-RDM-5303-prerelease - December 9 2019
**RDM-5303** Document file name disappears when you come back to the page from a previous page
**RDM-6135** Collection item is hidden when navigating back from Previous page

### Version 2.62.23-RDM-4324-prerelease - December 5 2019
**RDM-4324** DisplayOrder required for ComplexType elements


### Version 2.62.22-RDM-4837-prerelease
**RDM-4837** - Field interpolation syntax is displayed if the source field is NULL

### Version 2.62.21-RDM-4335-prerelease
**RDM-4335** - Implement and consume external POST Create Case endpoint in API v2

### Version 2.62.20-RDM-5883-prerelease - November 11 2019
**RDM-5883** - Implement and consume external GET Printable Documents endpoint in API v2

### Version 2.62.19-RDM-6084-prerelease November 8 2019
**RDM-6084** - Unable to open case in new tab from filter/search results pages

### Version 2.62.18-RDM-5296-prerelease
**RDM-5296** Table Collection View - Case Link is not displayed as a link
**RDM-5293** Table Collection View - Data from the first complex type is repeated for all collection items

### Version 2.60.5-RDM-6350-RC1-prerelease
**RDM-6350** - Fix for AboutToStart callback not showing errors correctly in UI

### Version 2.60.2-RDM-5928-RC1-prerelease
**RDM-6055** [Immigration and Asylum]- PDF file format is not supported by MV

### Version 2.60.2-RDM-5928-RC1-prerelease
**RDM-5928** [RC15.01] Show/Hide field within a Complextype field having value is not displayed

### Version 2.60.1-RDM-5582-RC1-prerelease
**RDM-5196** change the way search result component handles routing to case details(#406)
**RDM-4617** emitter for case view and draft store
**RDM-5310 ** ComplexElementsOnEvent: Proceed button does not render correctly when a Collection in a Complex is referenced
**RDM-4073 ** UI refactoring: introduce utility methods on CaseField isCollection and isCollectionOfComplex
**RDM-4135** Integrate Media Viewer
**RDM-5582** Upgrade MV to new version (Annotations support)

### Version 2.59.4 - August 19 2019
Revert 5398 - Document in collections

### Version 2.59.3 - August 19 2019
REVERT | **RDM-5310** Fix for ComplexElementsOnEvent when used with CRUD on Complex Type 

### Version 2.59.2 - August 19 2019
**RDM-5072** remove some bad code introduced in WriteAddressFieldComponent

### Version 2.59.1 - August 15 2019
**RDM-5398** Allow file upload document type whitelist

### Version 2.59.0 - August 15 2019
**RDM-4544** Allow file upload document type whitelist

### Version 2.58.19 - August 15 2019
**RDM-5310** Fix for ComplexElementsOnEvent when used with CRUD on Complex Type

### Version 2.58.18 - August 14 2019
**CLEAN RELEASE OF v2.58.13** Pay Component Upgrade

### Version 2.58.16 - August 13 2019
**RDM-4068** CRUD permissions on elements within complex types

### Version 2.58.15 - August 12 2019
**RDM-5604** Object instantiation with curly braces breaks read-label-field component

### Version 2.58.14 - August 07 2019
**RDM-4073** Ui refactoring: Introduce utility methods on CaseField isCollection and isCollectionOfComplex

### Version 2.58.13 - July 30 2019
**RDM-5318** Changes to make Workbasket tolerant of missing defaults

### Version 2.58.12 - August 01 2019
**RDM-5313** Inline mandatory validation error to be displayed for document upload field

### Version 2.58.11 - July 29 2019
**RDM-4692** ccd-write-address-field id fix

### Version 2.58.10 - July 26 2019
**RDM-5053**  Dynamic list: Page Show condition fix

### Version 2.58.9 - July 19 2019
**RDM-5031** redirect to case-list when user do not have access to the case after an event

### Version 2.58.8 - July 12 2019
**RDM-4673** Show/Hide condition handling on New Collection View UI change 

### Version 2.58.7 - July 11 2019
**RDM-4121** Console error when trying to Remove a collection item that has complex field with a collection item
**RDM-3480** Document links getting lost in Mandatory field on Complex Type

### Version 2.58.6 - July 10 2019
**RDM-5044** Fix for Field interpolation is broken on workbasket results

### Version 2.58.5 - July 09 2019
**RDM-4279** Fix for DAC Focus Order

### Version 2.58.3 - July 02 2019
**RDM-5168** Sumbitted Callback fix

### Version 2.58.2 - July 01 2019
**RDM-4266** DAC - List mark-up
**RDM-4274** DAC - Non-Descriptive form fields 
**RDM-4282** DAC - no postcode link P1 - Colour contrast

### Version 2.58.1 - July 1 2019
**RDM-4525** Remove unused id on write fixed list field template as breaking external tests.

### Version 2.58.0 - June 27 2019
**RDM-4890** Integrate New Postcode Lookup into CCD
**RDM-3782** Previous Case Reference data is displayed until new data is loaded
**RDM-4906** Payment web-component v1.8.6 integration in CCD

### Version 2.57.0 - June 26 2019
**RDM-4525** Ordering of fixed lists 

### Version 2.56.0 - June 25 2019
**RDM-2987** Markdown supporting Iterating collection items when accessing Complex elements

### Version 2.55.2 - June 24 2019
**RDM-4512** Remove console warning message

### Version 2.55.1 - June 19 2019
**RDM-4264** DAC - Duplicate postcode input IDs

### Version 2.55.0 - June 13 2019
**RDM-4781** RDM-4781-Data not being shown on multi-select list

### Version 2.54.0 - June 07 2019
**RDM-4336** RDM-4336 New external V2 Create Event endpoint  

### Version 2.53.0 - June 07 2019
**RDM-4537** Case List Filters extraction and new contract

### Version 2.52.0 - June 07 2019
**RDM-2804** OR and Not Equals support for Show and Hide

### Version 2.51.1 - June 07 2019
	**RDM-4927** | Fixed list not populating values for collection fields, Unit test fixes

### Version 2.51.0 - May 29 2019
	**RDM-3201** Dynamic Fixed Lists (Using service callbacks)

### Version 2.50.2 - May 29 2019
**RDM-4687** Continue button is not enabled for a mandatory collection field that includes show/hide conditions inside complex fields

### Version 2.50.1 - May 29 2019
**RDM-4622** Page Show Conditions not working as expected in CaseEventToFields

### Version 2.50.0 - May 28 2019
**RDM-4537** Case List Filters extraction and new contract

### Version 2.49.2 - May 21 2019
**RDM-876** Hide print button when not configured  

### REVRTED Version 2.49.0 - May 14 2019
**RDM-4537** Case List Filters extraction and new contract

### Version 2.48.0 - May 7 2019
**RDM-4575** search filters definition service

### Version 2.47.0 - May 7 2019
**RDM-4574** Create Case Filters componant retrieve jurisdiction internally 

### Version 2.46.0 - May 1 2019
**RDM-3496** Case View of Nested Complex Types - Collection of complex types within complex types

### Version 2.45.0 - April 29 2019
**RDM-3460** Complex element *only* as list screen input

### Version 2.43.0 - April 29 2019
**RDM-4386** Make print, event selector and history tab optional but present by default
**RDM-4130** Extract Results List Component to toolkit 

### Version 2.42.3 - April 23 2019
**RDM-3940** Add Hide and Show support to new ComplexTypeToEvent mapping

### Version 2.42.2 - April 17 2019
**RDM-3325/4591** - Text field whitespaces fix

### Version 2.42.1 - April 16 2019
**RDM-3897** - Add optional property casereference to the CaseEventData object

### Version 2.42.0 - April 15 2019
**RDM-4184** - Remove Fixed History Tab

### Version 2.41.1 - April 12 2019
**RDM-3525-Bug-Fix** - Disable previous button and cancel link on click on submit

### Version 2.41.0 - April 11 2019
**RDM-3325-Firefox-Bug-Fix** - Mandatory Text field breaks the UI on Firefox
**RDM-4521** - Confirmation green bar not displayed

### Version 2.39.0 - March 27 2019
**RDM-3325** - CCD does not apply validation rules to text fields containing only whitespace characters

### Version 2.38.0 - March 26 2019
**RDM-4190** - Case Timeline integrated with Demo app

### Version 2.37.0 - March 15 2019
**RDM-2348** - Grey bar for on same page hide and show of fields

### Version 2.36.1 - March 15 2019
**RDM-4177** - Event Selector fix

### Version 2.36.0 - March 14 2019
**RDM-4177** - New Event Selector contract

### Version 2.35.0 - March 12 2019
**RDM-4187** - Add new Case Timeline Component

### Version 2.34.0 - March 11 2019
**RDM-3699** - Font size inconsistencies throughout CCD

### Version 2.33.0 - March 7 2019
**RDM-4233** - demo case progression fix
**RDM-4109** - flexible case history tab component

### Version 2.32.0 - March 6 2019
**RDM-3471** - As a user I am able to view collections in table (columns) without accordions
**RDM-3472** - As a user I can expand/collapse collection table rows - case details
**RDM-3473** - As a user viewing collection table on case details I can sort

### Version 2.31.0 - March 4 2019
**RDM-3972** - Case list and seach in CCD does not show the case reference number with hyphen
**RDM-3936** - Update Court staff footer to provide seperate info for each service

### Version 2.30.0 - March 1 2019
**RDM-RDM-4009** - New Search API V2 endpoint

### Version 2.29.0 - February 28 2019
**RDM-3916** - Move create case filters to toolkit and implement new contract

### Version 2.27.1 - February 22 2019
**RDM-3430** - Run polling outside angular zone

### Version 2.28.0 - February 27 2019
**RDM-4109** - Management web consuming the new case history base type

### Version 2.27.0 - February 21 2019
**RDM-2986** - New ComplexType to Events mapping

### Version 2.26.0 - February 19 2019
**RDM-3915** - Extract Case Create filters component as is

### Version 2.25.0 - February 13 2019
**RDM-3820** - New contract - extract Case Search Form component

### Version 2.24.1 - February 13 2019
**RDM-2963** changed initialisation values to null 

### Version 2.24.0 - February 12 2019
**RDM-3821** - Extract Case Search Form to ui-toolkit as is

### Version 2.23.5 - February 08 2019
**Test Fixes** - Upgrade to Chrome Headless

### Version 2.23.4 - February 08 2019
**RDM-3675** - fix to image sourcing

### Version 2.23.3 Beta-v3 - February 07 2019
**RDM-3695/RDM-3752** - CRUD contract on Collection Items FE Changes Beta-v3

### Version 2.23.2 Beta-v2 - February 07 2019
**RDM-3695/RDM-3752** - CRUD contract on Collection Items FE Changes Beta-v2

### Version 2.23.1 Beta - February 07 2019
**RDM-3695/RDM-3752** - CRUD contract on Collection Items FE Changes Beta

### Version 2.23.0 - February 06 2019
**RDM-3799** - New case view contract.
**RDM-3545** - Case Linking - Error text missing when value input into field of type CaseLink fails validation on event

### Version 2.22.2 - Beta Release - February 02 2019
**RDM-3849** - Fixed hide show not enabled

### Version 2.22.0 - January 25 2019
**RDM-3675** - Extraction of Case View into toolkit

### Version 2.21.2 - January 22 2019
**RDM-3584** - Previous page data to be sent on Midevent callback

### Version 2.21.0 - January 14 2019
**RDM-2806** - Markdown in CYA displays the actual Markdown (used for Section headings)
**RDM-3401, RDM-3403, RDM-3404, RDM-3409, RDM-3410** - Accessibility fixes

### Version 2.20.2 - January 10 2019
**RDM-3628** - revert for CRUD contract on Collection Items - Standard API

### Version 2.20.1 - January 9 2019
**RDM-3628** - Add null check for CaseLinks

### Version 2.20.0 - January 9 2019
**RDM-2455** - CRUD contract on Collection Items - Standard API

### Version 2.19.1 - January 9 2019
**RDM-3594** - Fix failed regex (callback) validation not being displayed in the Error Box

### Version 2.19.0 - January 9 2019
**RDM-3651** - Update Check Your Answer wording

### Version 2.18.0 - January 8 2019
**RDM-3574** - UI Toolkit: Use Post/Put/Get/Delete Draft endpoint in API v2

### Version 2.17.0 - December 18 2018
**RDM-3501** - UI Toolkit: Use Get Profile API v2

### Version 2.15.0 - December 14 2018
**RDM-2323** - Support field concatenation in List / results views

### Version 2.14.0 - December 14 2018
**RDM-3502** - UI Toolkit: Use Validate API v2

### Version 2.13.0 - December 12 2018
**RDM-3512** - Implement internal Get Trigger for Draft endpoint in API v2

### Version 2.12.1 - December 12 2018
**RDM-3418** - BUG FIX - Validation errors prevents navigation

### Version 2.12.0 - December 10 2018
**RDM-3256** - Save and Resume content changes

**Revert-RDM-3284** - Revert RDM-3284 until Backend changes are completely implemented

**RDM-2974** - Implement the `<BR>` style for Markdown linebreaks

### Version 2.11.0 - December 07 2018 - *Deprecated Version*
**RDM-3284** - CRUD contract on Collection for Add new item

### Version 2.10.0 - December 06 2018
**RDM-3484** - Start consuming new start event internal API endpoint (mgmt web and demo app).

### Version 2.9.0 - December 5 2018
**RDM-2009** - ComplexType element (non-collection) in Labels (with markdown) & show/hide
**RDM-3391** - Radio option should be selected when clicked on the label text

### Version 2.8.1 - November 28 2018
**RDM-3463** - Update dependency on compodoc to Version 1.1.7, to eliminate vulnerability introduced by compromised version (> 3.3.4) of event-stream package.

### Version 2.8.0 - November 22 2018
**RDM-3427** - Start consuming new start case internal API endpoint (mgmt web and demo).

### Version 2.7.0 - November 22 2018
**RDM-2803** - Hide & Show to support multiple ANDs and CONTAINS.
**RDM-1893** - As a user I am able to see fixed list as a radio buttoned list - New Type 'RadioButtonList'

### Version 2.6.0 - November 20 2018
**RDM-3238** - Support for case linking.

### Version 2.5.1 - November 15 2018
**RDM-3230** - Small patch to export profile service.

### Version 2.5.0 - November 14 2018
**RDM-3000** - Support for Midevent Callback (Display of Errors and Warning messages)

### Version 2.4.0 - November 12 2018
**RDM-3230** - Up version of angular to fix Router bug angular/angular#26496

### Version 2.3.0 - November 09 2018
**RDM-3230** - Relax versions for yarn and npm in engine section.

### Version 2.2.0 - November 09 2018
**RDM-3230** - Heroku publish script and simplifying deployment process. Fixing builds steps and removing postinstall which now is heroku-postbuild and does not affect pipeline or other teams now.

### Version 2.1.0 - November 08 2018
**RDM-3230** - Demo app published to Heroku. New library directory structure. Reorganising the code. Refactor old rxjs 5 syntax to 6. Fixes to the lib around how event trigger is being loaded and how router handles loading non existent pages.

### Version 2.0.0 - November 06 2018
**RDM-3064** - Case progression: Better component contract

### Version 1.2.32 - November 06 2018
**RDM-3230** - Fix to emit event id when submitting in case create or progress components. Updated stub. Updated styling of demo app.

### Version 1.2.31 - November 03 2018
**RDM-3230** - Fix alert error when going to first page if no page param or no fields or pages in data specified.

### Version 1.2.30 - November 03 2018
**RDM-3230** - Fix issue with routing to start page broken when non existent page is requested.

### Version 1.2.29 - October 31 2018
**RDM-3230** - Add missing providers in CaseEditorModule and write up README of demo app.

### Version 1.2.28 - October 29 2018
**RDM-3230** - Vanilla app to POC the case progression facade components

### Version 1.2.27 - October 29 2018
**RDM-1202** - Custom case event field labels and hint texts

### Version 1.2.24 - October 19 2018
**RDM-3064** Add CaseCreateComponent and CaseProgressComponent to NgModule.

### Version 1.2.23 - October 19 2018
**RDM-3064** Case progression: Merge master

### Version 1.2.22 - October 19 2018
**RDM-3064** Case progression: Better component contract + 	Facilitate configuration of case progression component

### Version 1.2.21 - October 18 2018
**RDM-3144** - Merged changes from 1.2.18 & 1.2.20

### Version 1.2.20 - October 18 2018
**RDM-3144** - Updates on tags

### Version 1.2.19 - October 18 2018
**RDM-3144** - Added missing exports

### Version 1.2.18 - October 18 2018
**RDM-3178** + **RDM-3179** + bug fix to cancel on CYA page of create case event with S&R

### Version 1.2.17 - October 18 2018
**RDM-3144** - CaseTypeLite class introduced. Jurisdiction now refers to CaseTypeLite instead of CaseType to prevent cyclic dependency.

### Version 1.2.16 - October 15 2018
**RDM-3063** - Case Progression: Extract case progression with existing contract part 2

### Version 1.2.15 - October 15 2018
**RDM-3063** - Case Progression: Extract case progression with existing contract

### Version 1.2.14 - October 11 2018
**RDM-3061** - Case progression: Extract services from Case Management Web.

### Version 1.2.13 - October 10 2018
**RDM-3023** - Migration of save or discard modal from mgmt web.

### Version 1.2.12 - October 9 2018
**RDM-3023** - Fixing release issues.

### Version 1.2.11 - October 9 2018
**RDM-3023** - Move palette from mgmt web part 4.

### Version 1.2.10 - October 8 2018
**RDM-3023** - Move palette from mgmt web part 3.

### Version 1.2.9 - October 8 2018
**RDM-3023** - Move palette from mgmt web part 3.

### Version 1.2.8 - October 8 2018
**RDM-3023** - Move palette from mgmt web part 2.

### Version 1.2.6 - October 4 2018
**RDM-3023** - Move palette from mgmt web.

### Version 1.2.5 - September 27 2018
**RDM-2569** - Upgraded to Angular version 6.1.8

### Version 1.2.4 - August 31 2018
**RDM-2468** Bug:
- Date field error correction

### Version 1.2.3 - August 24 2018
- New publishing key

### Version 1.2.2 - August 22 2018
**RDM-2542** Enhancement:
- GDPR - Solicitors footer links

### Version 1.2.1 - July 3 2018
- New publishing key

### Version 1.2.0 - July 3 2018
- Upgraded to Angular version 5.2.0

### Version 1.1.8 - July 3 2018
- Bumped the version to 1.1.8

### Version 1.1.7 - July 2 2018
**RDM-1886** Enhancement:
- Sign Out link redesign

### Version 1.1.6 - May 24 2018
**RDM-1149** Fixes added:
- Mandatory field skipping issue found in tests fixed
- Several PR comments addressed

### Version 1.1.5 - May 22 2018
**RDM-1149** Fixes added:
- Issue 'error on single digit hour'
- Incorrect Hour/Minute/Second initialization when field is mandatory
- Changed to a simpler Regex validation
- Bumped the version to 1.1.5

### Version 1.1.4 - May 22 2018
Bumped up the version

### Version 1.1.3 - May 22 2018
**RDM-1149** Added _DateTime_ support to the existing _Date_ component

### Version 1.1.2 - May 21 2018
**RDM-1851** Added support for few elements not rendering properly in IE Browsers
**RDM-1851** Added Feedback link

### Version 1.1.1 - May 18 2018
**RDM-1851** Header and footer needs to match Gov.Uk styling - Attempt to put back README to overcome a problem in npmjs

### Version 1.1.0 - May 18 2018
**RDM-1851** Header and footer needs to match Gov.Uk styling
