@all
Feature: Case field Date and Datetime picker

    Background: Mock event setup
        Given I init MockApp
        Given I setup event "DateTimeFieldTestEvent" for Date time picker test
        
    Scenario: Date time picker displayed when displat_context_parametr is supplied else no

        Given I start MockApp
        Given I navigate to demo app
        Given I navigate to module page "Create Case"

        Then I see field with cssLocator displayed "ccd-write-date-field #dateField cut-date-input"
        Then I see field with cssLocator displayed "ccd-write-date-field #dateTimeField cut-date-input"



    Scenario: Date time picker displayed when displat_context_parametr is supplied else no
        Given I set field properties for field with id "dateField" in event "DateTimeFieldTestEvent"
            |display_context_parameter|
            | #DATETIMEENTRY(YYYY-MM-DD hh:mm:ss) |

        Given I set field properties for field with id "dateTimeField" in event "DateTimeFieldTestEvent"
            | display_context_parameter           |
            | #DATETIMEENTRY(YYYY-MM-DD hh:mm:ss) |
        Given I start MockApp
        Given I navigate to demo app
        Given I navigate to module page "Create Case"

        Then I see field with cssLocator displayed "ccd-write-date-container-field ccd-datetime-picker  #dateField"
        Then I see field with cssLocator displayed "ccd-write-date-container-field ccd-datetime-picker  #dateTimeField"

