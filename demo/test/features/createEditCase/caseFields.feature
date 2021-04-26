@all
Feature: Case field Date and Datetime picker

    Background: Mock event setup
        Given I init MockApp
        Given I setup event "DateTimeFieldTestEvent" for Date time picker test

    Scenario: Date time picker displayed when display_context_parametr is supplied else no

        Given I start MockApp
        Given I navigate to demo app
        Given I navigate to module page "Create Case"

        Then I see field with cssLocator displayed "ccd-write-date-field #dateField cut-date-input"
        Then I see field with cssLocator displayed "ccd-write-date-field #dateTimeField cut-date-input"



    Scenario: Date time picker displayed when displat_context_parametr is supplied else no
        Given I set field properties for field with id "dateField" in event "DateTimeFieldTestEvent"
            | key                       | value                                                 |
            | display_context_parameter | #TEST(YYYY-MM-DD),#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss) |

        Given I set field properties for field with id "dateTimeField" in event "DateTimeFieldTestEvent"
            | key                       | value                                                 |
            | display_context_parameter | #TEST(YYYY-MM-DD),#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss) |
        Given I start MockApp
        Given I navigate to demo app
        Given I navigate to module page "Create Case"

        Then I see field with cssLocator displayed "ccd-write-date-container-field ccd-datetime-picker  #dateField"
        Then I see field with cssLocator displayed "ccd-write-date-container-field ccd-datetime-picker  #dateTimeField"



    Scenario: Multiple date time fields in page
        Given I create mock Case event "muliDateFields"
        Given I add page to event "muliDateFields"
            | reference | id    | label                 |
            | page1     | page1 | Page 1 for mock event |
        Given I add fields to page "page1" in event "muliDateFields"
            | id  | type     | label        |
            | dt1 | DateTime | Date 12 hour |
            | dt2 | DateTime | Date 2       |
            | dt3 | DateTime | Date 3       |
            | dt4 | DateTime | Date 24 hour |
        Given I set field properties for field with id "dt1" in event "muliDateFields"
            | key                       | value                                                 |
            | display_context_parameter | #TEST(YYYY-MM-DD),#DATETIMEENTRY(YYYY-MM-DD hh:mm:ss) |

        Given I set field properties for field with id "dt2" in event "muliDateFields"
            | key                       | value                      |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM-DD) |

        Given I set field properties for field with id "dt3" in event "muliDateFields"
            | key                       | value                   |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM) |
        Given I set field properties for field with id "dt4" in event "muliDateFields"
            | key                       | value                                                 |
            | display_context_parameter | #TEST(YYYY-MM-DD),#DATETIMEENTRY(YYYY-MM-DD HH:mm:ss) |
        Given I set case event "muliDateFields" in mock

        Given I start MockApp

        Given I navigate to demo app
        Given I navigate to module page "Create Case"
        When I enter case event field values for event "muliDateFields"
            | fieldId | value                  |
            | dt1     | 2020-02-20 10:20:30 AM |
            | dt2     | 2020-01-10             |
            | dt3     | 2020-03                |
            | dt4     | 2020-02-20 23:20:30    |
        Then I validate datetime field values in case edit page
            | fieldId | value                  |
            | dt1     | 2020-02-20 10:20:30 AM |
            | dt2     | 2020-01-10             |
            | dt3     | 2022                   |
            | dt4     | 2020-02-20 23:20:30    |


    Scenario: Multiple date fields in page
        Given I create mock Case event "muliDateFields"
        Given I add page to event "muliDateFields"
            | reference | id    | label                 |
            | page1     | page1 | Page 1 for mock event |
        Given I add fields to page "page1" in event "muliDateFields"
            | id  | type | label  |
            | dt1 | Date | Date 1 |
            | dt2 | Date | Date 2 |
            | dt3 | Date | Date 3 |
        Given I set field properties for field with id "dt1" in event "muliDateFields"
            | key                       | value                                  |
            | display_context_parameter | #TEST(YYYY),#DATETIMEENTRY(YYYY-MM-DD) |

        Given I set field properties for field with id "dt2" in event "muliDateFields"
            | key                       | value                   |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM) |

        Given I set field properties for field with id "dt3" in event "muliDateFields"
            | key                       | value                |
            | display_context_parameter | #DATETIMEENTRY(YYYY) |

        Given I set case event "muliDateFields" in mock

        Given I start MockApp

        Given I navigate to demo app
        Given I navigate to module page "Create Case"
        When I enter case event field values for event "muliDateFields"
            | fieldId | value      |
            | dt1     | 2020-02-20 |
            | dt2     | 2020-01    |
            | dt3     | 2020       |

        Then I validate datetime field values in case edit page
            | fieldId | value      |
            | dt1     | 2020-02-20 |
            | dt2     | 2020-01    |
            | dt3     | 2022       |


    Scenario: Multiple date and date time fields in page
        Given I create mock Case event "muliDateFields"
        Given I add page to event "muliDateFields"
            | reference | id    | label                 |
            | page1     | page1 | Page 1 for mock event |
        Given I add fields to page "page1" in event "muliDateFields"
            | id  | type     | label  |
            | dt1 | DateTime | Date 1 |
            | dt2 | Date     | Date 2 |
            | dt3 | DateTime | Date 3 |
            | dt4 | Date     | Date 4 |
        Given I set field properties for field with id "dt1" in event "muliDateFields"
            | key                       | value                               |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM-DD hh:mm:ss) |

        Given I set field properties for field with id "dt2" in event "muliDateFields"
            | key                       | value                      |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM-DD) |

        Given I set field properties for field with id "dt3" in event "muliDateFields"
            | key                       | value                   |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM) |
        Given I set field properties for field with id "dt4" in event "muliDateFields"
            | key                       | value                |
            | display_context_parameter | #DATETIMEENTRY(YYYY) |
        Given I set case event "muliDateFields" in mock


        Given I start MockApp

        Given I navigate to demo app
        Given I navigate to module page "Create Case"
        When I enter case event field values for event "muliDateFields"
            | fieldId | value                  |
            | dt1     | 2020-02-20 10:20:30 AM |
            | dt2     | 2020-01-10             |
            | dt3     | 2020-03                |
            | dt4     | 2022                   |
        Then I validate datetime field values in case edit page
            | fieldId | value                  |
            | dt1     | 2020-02-20 10:20:30 AM |
            | dt2     | 2020-01-10             |
            | dt3     | 2020-03                |
            | dt4     | 2022                   |


@test
    Scenario: Multiple date and date time fields in page
        Given I create mock Case event "muliDateFields"
        Given I add page to event "muliDateFields"
            | reference | id    | label                 |
            | page1     | page1 | Page 1 for mock event |
        Given I add fields to page "page1" in event "muliDateFields"
            | id     | type     | label             |
            | dt1    | DateTime | Date 1            |
            | f2     | Complex  | complex 1         |
            | f2.l1  | Text     | text in complex   |
            | f2.dt1 | Date     | Date Mandatory    |
            | f2.dt2 | Date     | DateTime Optional |
            | f2.dt3 | Date     | DateTime readonly |
        # | f2.c1    | Complex  | Complex in f2       |
        # | f2.c1.t2 | Text     | Text in c1 f2       |
        Given I set field properties for field with id "f2.dt1" in event "muliDateFields"
            | key                       | value                                                                |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM-DD hh:mm:ss),#DATETIMEENTRY(YYYY-MM hh:mm:ss) |
        Given I set field properties for field with id "f2.dt2" in event "muliDateFields"
            | key                       | value                                                                |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM-DD hh:mm:ss),#DATETIMEENTRY(YYYY-MM hh:mm:ss) |
        Given I set field properties for field with id "f2.dt3" in event "muliDateFields"
            | key                       | value                                                                |
            | display_context_parameter | #DATETIMEENTRY(YYYY-MM-DD hh:mm:ss),#DATETIMEENTRY(YYYY-MM hh:mm:ss) |
        Given I set complex field overrides for case field "f2" in event "muliDateFields"
            | complex_field_element_id | display_context |
            | f2.dt1                   | MANDATORY       |
            | f2.dt2                   | OPTIONAL        |
            | f2.dt3                   | READONLY        |

        Given I set event default values for event "muliDateFields"
        Given I set caseField values in event config "muliDateFields"
            | id     | value                    |
            | f2.dt1 | 2020-12-12T12:12:12.000Z |
            | f2.dt2 | 2021-11-11T11:11:11.000Z |
            | f2.dt3 | 2021-10-10T11:11:11.000Z |

        Given I set case event "muliDateFields" in mock

        Given I start MockApp
        Given I navigate to demo app
        Given I navigate to module page "Create Case"

