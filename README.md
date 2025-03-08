[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/tRxoBzS5)
Add design docs in *images/*

## Please visit this website for a clearer picture of the UML Diagrams: https://lucid.app/lucidchart/7f5c32e5-355c-4bbf-b4ac-ec23f8149c05/edit?viewport_loc=4643%2C-2248%2C3152%2C1309%2C0_0&invitationId=inv_b04a4a3b-f2f9-4e59-80b3-fc21bb5edd82

## Application Design

The application has 5 defined schemas in the mongo database, answers, comments, questions, tags, and users. The session is also stored in the database. The application starts in App.js then goes to MainPage. MainPage.js
is where the schemas are pulled from the database to be the latest versions and set as state variables. The default current page is set to welcome. If the user clicks on register the Register class is rendered. If the
user clicks on login the login page is rendered. The header page is rendered automatically for every type of page, but the button options even in the header will change depending on the current page.
Once the user logs in Main table is rendered and all the values from state are passed to the MainTable class. MainTable automatically renders Left class and Right class. Left class displays links to All questions and All tags. Right class has many conditionals based on what the currentPage is which is updated based on the buttons user clicks on, the default value after Login is QuestionTable. The right class also sets state variables that are updated based on values user clicks.

The QuestionTable class shows all the current questions in the database. There are also buttons one can click on to have the questions sorted in the correct order. AnswerTable class renders all the answers for the question user clicked on with the specific question at the top and the user can comment on the questions or the answers. There are also the options for the user to upvote or downvote a question, answer or comment. The ProfilePage class renders the all questions the user asked as default or if the user is admin then all users in the database. There are also the options to view all answers or all tags of a specific user. The QuestionForm and AnswerForm classes are called when user clicks on ask a question or add a comment.
The Tags page is rendered when user clicks on All tags.

## How to use

To run this application one needs to be connected to mongod and the node.js server. To populate the database with values one can run the init.js script where they will need to specify the username(email) 
and password of the admin. The user can choose to skip this step and start the application from scratch.
The user then can click on either login, register, or sign up.

If the user clicks on guest user they don't have to enter any account information, then are sent to the main question page. From here the user can click on newest,
active, or unanswered to sort all the questions. The user can enter a tag like so, [<tag name>] to search for questions with specific tags which are then rendered on the screen, and/or the user can at the same time search for a
word or substring of a word that is included in title or text for each question. The guest user can click on a specific question to see all answers associated with that question and the user can click on Tags on the left side to see all tags. The user can click on a tag to see all questions associated with that tag. To exit the user should click on the welcome button.

If the user clicks on register they will need to enter account information. They will then be redirected to the login form.

If the user clicks on login and enters their account information correctly then they will be sent to the main page where all questions are rendered. The logged in user can choose which way to sort the questions and use the search bar the same way as the guest user mentioned above. In addition, they have the option to ask questions, answer questions, create comments, and vote. To submit a comment one needs to press on the enter key on their keyboard. The user can click on the Tags link on the left side to see all tags and by clicking on a tag they will see all questions with that tag. In addition, they have the option to view their profile by clicking on the profile button. A normal logged in user should see by default when clicking on the profile page all questions user asked, the Questions link in the main middle bar. By selecting a question they can edit the form. They then should select either post question to update the question they modified or delete to delete the question completely. They can click on AnsweredQs link in the main middle bar to see all questions they answered. By selecting one of the question's user answered the user will see the question along with all the answers for that question, but their answers will show up first. They have the option to add a new comment here, vote, and also to edit or delete the answer they created. By clicking on edit the answer form appears where they can modify the answer input and post the updated answer which then takes them back to right where they were before selecting the edit button. The logged in user can also choose to delete their answer by selecting the delete button, which is right next to the edit button, just below the username and answer time for that answer. By selecting the profile button again they can then choose another option from the middle bar called Tags. This option will take them to see all tags they created. They then have the option to edit or delete the tag by clicking on the edit or delete button for that specific tag. If edit is selected to save the edit select the save button. To delete select the delete button.

An admin user will see all users listed by username by default. The admin will also see the option to delete a user which also deletes all questions user asked along with the questions tags, all answers user created, and all comments user made. The admin can do this by selecting yes when the popup asks the admin "Are you sure you want to delete the user?". When the admin user clicks on a user all questions the user asked will be rendered. From here the admin has all the abilities that the logged in user mentioned above has.

## Team Member 1 Contribution - Zoe Lucas

- Implemented register and login functionality.
- Enabled rendering of all questions user asked, user answered, and tags.
- Worked on being able to edit and delete questions, answers, and tags.
- Worked on UML and the README.

## Team Member 2 Contribution - Tracy Yip
- Worked on improving search functions
- Fixed up registration form and schemas
- Comments for questions and answers
- Worked on the profile page
- Websites CSS and appearance
- UML Diagram

