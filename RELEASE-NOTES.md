## RELEASE NOTES

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
