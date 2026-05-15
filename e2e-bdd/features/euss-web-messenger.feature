@EussWebMessenger
Feature: EUSS web messenger core journeys
  As a user of the EUSS chat service
  I want reliable messenger behavior
  So that I can manage cookies and use chat flows safely

  Scenario: Accept analytics cookies flow
    Given I open the EUSS web messenger
    Then I should see the EUSS messenger heading
    And I should see cookie banner action controls
    When I accept analytics cookies
    Then cookie action buttons should no longer be visible
    And I should see the hide cookie message button
    When I hide the cookie acceptance message
    Then I should not see the hide cookie message button

  Scenario: Reject analytics cookies flow
    Given I open the EUSS web messenger
    Then I should see the EUSS messenger heading
    And I should see cookie banner action controls
    When I reject analytics cookies
    Then cookie action buttons should no longer be visible
    And I should see the hide cookie message button
    When I hide the cookie acceptance message
    Then I should not see the hide cookie message button

  Scenario: Invalid page returns not found
    Given I open an invalid EUSS page
    When I accept analytics cookies
    And I hide the cookie acceptance message
    Then I should see the page not found heading

  Scenario: Look and feel, message exchange, and end chat flow
    Given I open the EUSS web messenger
    And I dismiss cookies by accepting
    Then I should see chat controls
    When I send the message "Hello"
    Then I should see my message "Hello"
    And I should see message metadata prefixed with "You at"
    And I should receive one more assistant response
    And I should see message metadata prefixed with "Digital assistant at"
    When I send the message "Can you assist me with my EUSS"
    Then I should see my message "Can you assist me with my EUSS"
    And I should see message metadata prefixed with "You at"
    And I should receive one more assistant response
    And I should see message metadata prefixed with "Digital assistant at"
    When I open the end chat dialog
    Then I should see end chat confirmation controls
    When I choose to keep chatting
    Then I should see my message "Hello"
    And I should see my message "Can you assist me with my EUSS"
    When I open the end chat dialog
    And I confirm ending the chat
    Then I should see the chat ended page
    And I should not see chat input or message history

  Scenario: Character limit flow
    Given I open the EUSS web messenger
    And I dismiss cookies by accepting
    When I fill the input with 4096 characters of "a"
    And I send the current message
    Then I should see message metadata prefixed with "You at"
    When I fill the input with 4097 characters of "b"
    Then I should see character counter text "0 characters left"
    And the input should be clamped to 4096 characters of "b"
    And the send button should be enabled

  Scenario: Open accessibility statement from start page
    Given I open the EUSS web messenger
    And I dismiss cookies by accepting
    When I open the accessibility statement from the footer
    Then I should see the EUSS accessibility statement

  Scenario: Navigate to cookies page and back to chat
    Given I open the EUSS web messenger
    When I open the cookies page from the footer
    Then I should see the cookies page
    When I navigate back in the browser
    Then I should see chat input

  @history
  Scenario: Send 26 sequential messages and continue after refresh
    Given I open the EUSS web messenger
    And I dismiss cookies by accepting
    When I send 26 sequential messages with prefix "euss sequential message"
    Then I should see my message "euss sequential message 26"
    When I refresh the page
    And I send the next sequential message with prefix "euss sequential message"
    Then I should observe one more inbound message after refresh
