\## WEB PROGRAMMING WITH NODE.JS - 502070



```

SEMESTER 2 – ACADEMIC YEAR 2024 – 2025

Lecturer: Mai Van Manh

```

```

FINAL PROJECT

```

\# E-commerce Website



For content highlighted in \*\*purple\*\* , students must adhere strictly to the descriptions provided. Any deviation, modification, or addition of features will



result in the submission being disqualified from evaluation.



\### I. OVERVIEW



The final project of this course involves developing a fully functional e-commerce website. This project will test your knowledge of web



development using Node.js on the backend, along with any front-end framework of your choice. The project will be completed in groups



of 2-3 members. Each group will be required to design, implement, and deploy an e-commerce application that includes essential features



such as user authentication, product management, and an order system. You are free to choose supporting libraries and tools to enhance



your application’s functionality, but the core backend must be developed using a Node.js framework like Express.js. To prevent fraud, you



are required to develop a website that exclusively sells \*\*computers and computer components\*\*. The sale of phones or any other products





is strictly prohibited, and any violation of this rule will result in a score of 0 for the entire project. You will also need to deploy your



application to a public hosting service (e.g., Heroku, Vercel, AWS, etc.) or, alternatively, containerize your project using Docker Compose



and provide the necessary Docker configurations for it to run locally on any machine.



\### II. PROJECT REQUIREMENTS



\*\*1. Landing Page (home page)\*\*

&nbsp;   - This is the first page that users will see when they visit the website. The website must display a selection of products in the

&nbsp;      categories “New Products,” “Best Sellers,” and at least three other distinct categories (for example: laptops, monitors, hard drives).

&nbsp;      Users are not required to log in in order to browse and purchase products.

&nbsp;   - The website must allow users to make purchases without logging in. If they make a purchase without logging in, an account will be

&nbsp;      automatically created for the user (if they do not have one already), the order information will be saved, and in the future if the

&nbsp;      customer logs in, they will be able to review their previous orders.

&nbsp;   - If the customer purchases after logging in, the default address (if any) will be pre-filled in the checkout section. In addition, the

&nbsp;      user can also change to a different shipping address if desired.

&nbsp;   - To keep things simple, the system only needs to support two types of users: customers and a single administrator.

\*\*2. User Management\*\*

&nbsp;   - User Registration and Login: Allows users to create accounts, log in, and manage their profiles. When creating an account, users

&nbsp;      only enter their email, full name and shipping address.

&nbsp;   - Social Media Authentication: Users can log in using any social media account, e.g. Google or Facebook, etc for convenience.

&nbsp;   - Profile Management: Users can update their personal information, change/recover passwords, and manage multiple delivery

&nbsp;      addresses for each delivery address.

\*\*3. Product Management\*\*

&nbsp;   - Product Catalog: A dedicated page (not landing page) that displays a list of products with basic information such as name, price,

&nbsp;      image and short description (in listview or gridview), with a pagination mechanism applied to limit the number of products

&nbsp;      displayed at the same time. Organizes products into categories and tags to improve navigation and SEO. The pagination feature

&nbsp;      must function everywhere that product lists are displayed. It should show the page numbers, even if there is only one page. When





```

presenting a demonstration, if the website lacks sufficient data to showcase the ‘pagination’ feature, it will be considered as not

having this functionality.

```

\- The product details page should display comprehensive information about a specific product, including its name, price, brand, a

&nbsp;   list of variants (if available), a short description of at least five lines, and a minimum of three illustrative images. Below the product

&nbsp;   information, there should be a section for user comments and star ratings. The website must support products with multiple

&nbsp;   variants, each having independent inventory tracking. To achieve full marks for this section, every product must have at least two

&nbsp;   variants.

\- Product Ordering: Sort the list of results (products) by some criteria like: price (ascending/descending), relevance, etc. To earn full

&nbsp;   marks for this section, the website must provide at least four sorting criteria, including: sorting by name (A-Z and Z-A) and sorting

&nbsp;   by price (ascending and descending).

\- Product Search and Filtering: Users can search for products and filter results by attributes such as price, category, or rating. To

&nbsp;   achieve full marks for filtering section, the website must include at least three filtering criteria, with mandatory filters for brand

&nbsp;   and price (allowing users to select minimum and maximum values).

\- Product Reviews and Ratings: Users are not required to log in to leave comments, but they must be logged in (without the need to

&nbsp;   make a purchase) in order to rate the product with stars. If possible, use websockets to implement a feature that allows you to

&nbsp;   view updated comments and ratings without reloading the product detail page.

\*\*4. Cart and Checkout\*\*

\- Add to Cart: Allows users to add products to a shopping cart, with the ability to update quantities or remove items. The website

must allow users to modify the shopping cart and receive real-time updates (e.g., changes in quantity and price) without requiring

a page reload.

\- Cart Summary: Displays a summary of the items in the cart, including total price, taxes, and shipping fees.

\- Checkout Process: Guides users through a multi-step process to enter payment and shipping details, and confirm orders.

\- Guest Checkout: Lets users complete purchases without creating an account.

\- Discount Codes: The website must allow users to enter discount codes during checkout. These codes should be 5-character

alphanumeric strings created by the administrator. Discount codes will not have an expiration date but will have a usage limit

determined by the administrator, with a maximum limit of 10 uses per code. Shoppers must be able to see the validity and effect

of the discount code (if applicable) before completing the payment.

\*\*5. Order Management\*\*





\- Order Creation: After a successful payment, an order record should be created and linked to the user’s account. Once the purchase

&nbsp;   transaction is completed, the user must be shown a success screen displaying all relevant information about the order they just

&nbsp;   placed. Additionally, the user should receive a confirmation email with the details of the order.

\- Order Tracking: Allows users to track the status of their orders (e.g., pending, confirmed, shipping, delivered). In addition to viewing

&nbsp;   the current status of their order, customers must also be able to see the history of the order’s statuses. This can be presented in a

&nbsp;   table listing all statuses along with their corresponding update timestamps, arranged in reverse chronological order, with the most

&nbsp;   recent status displayed at the top.

\- Order History: The website must display the user’s previous orders, including details such as the order number, purchase date,

&nbsp;   total amount, status, and a list of products with their respective quantities for each order.

\- Loyalty Programs: A loyalty system should be implemented, where customers earn 10% of the total order amount as points for

&nbsp;   each purchase. For example, with an order total of 1,000,000 VND, the customer will accumulate 100 points, which is equivalent

&nbsp;   to 100,000 VND. These points can be used immediately in the next order, with no additional restrictions.

\*\*6. Admin Management\*\*

\- Dardboards:

o Simple Dashboard: a high-level overview of the store’s performance, key metrics, and actionable insights. This includes

things like: Total number of users, number of new users, number of orders, revenue, best-selling products represented

through charts.

o Advanced Dashboard: Display statistics and relevant charts for key information across specific time intervals. By default, the

data is shown annually, but users have the flexibility to adjust the view to quarterly, monthly, weekly, or based on a defined

start and end date. For each of these timeframes, it is essential to track the number of orders sold, total revenue, and overall

profit. Additionally, there should be comparative charts showing revenue, profit, number of products, and types of products

sold, broken down by year, month, quarter, and week.

\- Product Management: Admins can add, update, or delete products, manage categories, and handle inventory from a central

dashboard.

\- User Management: Admins can view and manage all users, including banning or updating user information.

\- Order Management: Admins can view, update, and process orders (e.g., changing status from pending to confirmed).





```

o View order list: The administrator can view the system-wide order list, sorted with the most recent orders first. Pagination

should be applied, displaying around 20 items per page. This interface should also allow the administrator to filter orders

by various time ranges, such as: today, yesterday, this week, this month, or a specific date range (start-end).

o View order details: The administrator can select an order to view its detailed information (such as buyer’s name, purchase

time, total amount, whether a discount was applied, etc.), as well as the list of products in the order. Additionally, the admin

can also change the order status (e.g., from pending to confirmed).

```

\- Discount management: The administrator should have the ability to view a list of discount codes along with relevant details,

&nbsp;   including the creation time, discount value, the number of times the code has been used out of the maximum allowed usage, and

&nbsp;   a list of orders where the coupon has been applied. Additionally, the administrator should be able to create new discount codes.

\- Other than the functions mentioned above, you must not add any extra features to the admin.



\*\*7. Deployment\*\*

You are required to select one of the two methods below to implement your team’s project. Successfully completing this task will not

grant you any extra points, but failing to do so will result in a penalty: a deduction of 1.0 point if your total score is 8.5 or above, and a

deduction of 0.5 point if your total score is below 8.5:



1\. Public Hosting:

&nbsp;   - The website should be deployed on any public cloud hosting platform (e.g., Heroku, Vercel, AWS, Netlify).

&nbsp;   - Provide the public URL to access your project.

&nbsp;   - Ensure that the website functions properly, just as it does in the local environment, as it will serve as the basis for evaluating

&nbsp;      your grade. Don’t forget to provider username/password for the admin account.

2\. Docker Compose:

&nbsp;   - If you choose not to deploy to a online hosting service, you must containerize the application using Docker Compose.

&nbsp;   - Each component (frontend, backend, database, etc.) should be in separate containers.

&nbsp;   - Provide the docker-compose.yml file, with clear instructions for running the project locally.

&nbsp;   - Make sure you have tested this Docker Compose setup and that it is functioning properly before submitting your project.

&nbsp;      Students must ensure that the instructor can run their project using only the command “docker compose up -d” Other

&nbsp;      commands, such as “npm install,” should be pre-configured within the docker compose YAML file or Dockerfile.

\*\*8. Other requirements\*\*





\- UI/UX: The web app must have a clear, user-friendly design with intuitive navigation. Focus on user experience, quick load times,

&nbsp;   and easy interaction with elements.

\- Team Collaboration: Team members must work together using version control (e.g., Git), dividing tasks and ensuring smooth

&nbsp;   integration of contributions. Regular communication is essential. You are required to demonstrate the group work process by

&nbsp;   capturing screenshots of team members’ contributions using the GitHub Insights feature. The evidence must clearly show that

&nbsp;   the project has been ongoing for at least one month from its start date, with each member making a minimum of two commits

&nbsp;   per week. Failure to meet these criteria may result in point deductions or no points being awarded for the teamwork component.

&nbsp;   Teams with only one member will not receive any points for teamwork.

\- Responsive Design: The web app should be responsive, adapting seamlessly to different devices and screen sizes. Use

&nbsp;   frameworks like Bootstrap or CSS Grid to ensure compatibility.

\- Horizontal Scaling: Design the app for horizontal scaling, allowing it to handle more traffic by adding servers. Implement stateless

&nbsp;   architecture, load balancing, and consider microservices. You can implement this on a public hosting service of your choice or

&nbsp;   using Docker Compose. Regardless of the approach, you must provide clear evidence of what has been accomplished.

\*\*10. Bonus features\*\*



Successfully implementing and fully completing the following features will earn an additional 0.5 points, with a maximum of 2 points for

all bonus features:



\- Using CICD pipeline during development: Jenkins, Github Actions, Circle CI, GitLab CI/CD, or one of the top 3 Cloud provider solution.

\- Deploy the system following a Microservices Architecture. In addition to the front end and database, there must be at least three

&nbsp;   other services. You must also demonstrate asynchronous communication and decoupling between services using an intermediary

&nbsp;   channel, such as RabbitMQ or Redis.

\- Integrate AI-related features, such as a smart chatbot that can suggest products directly related to this system, product search by

&nbsp;   image upload, and Sentiment Analysis for reviews and feedback.

\- Integrate ElasticSearch for Product Search: Implement ElasticSearch to enhance product search speed and efficiency. This

&nbsp;   integration should allow for fast, relevant search results, improving the overall user experience.



```

If your team successfully implemented any of these bonus features, you should clearly state it in the self-evaluation form, the README

file, the product introduction video along with specific, convincing evidence. This ensures that your contributions are recognized and

properly communicated to reviewers.

```



\### III. RUBRIK



\*\*ID FEATURES\*\*



```

1 2 3

```

```

POINTS 0 PT 1/2 PTS FULL POINTS

```

\## CUSTOMER FEATURES – 6.0 points



(^1) AuthenticationSocial Media 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

2 View profile page 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

3 Change password 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

4 Password recovery 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

5 Manageaddress^ multiple(more than one)^ delivery 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

6 View(login required)^ purchase history 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

7 View (login required)purchase^ details 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.





```

8 Landing Page 0.

```

```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

(^9) (View products by category)Product Catalog^ 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

10 Pagingation 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

11 View product details 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

(^12) (in the same detail page)View product variants^ 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

14 Product search by keyword 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

15 Product filtering 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

16 Product orderingprice, time)^ (e.g. by 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

17 Display shopping cart 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.





18 Update shopping cart 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

19 Checkout process 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

20 Using making purchasediscount code^ when 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

(^21) (after placing an order)Email notification^ 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

22 Product review (comment) 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

23 Product rating with stars 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

(^) and rating with websocketRealtime update review 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

24 Loyalty Programs 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.



\## ADMIN FEATURES – 2.0 points





26 User Management 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

25 Product Management 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

31 Discount management 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

29 View order list 0.



```

The implementation is missing,

non-functional, or contains major

issues preventing basic use

```

```

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

```

```

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

```

(^30) (and modify order status)View order details^ 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

27 Simple Dashboard 0.

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.

28 Advanced Dashboard \*\*0.\*\*

The implementation is missing,

non-functional, or contains major

issues preventing basic use

The functionality is present but

incomplete, with issues such as poor

input validation, security flaws, or lack of

adherence to standards.

The functionality is fully implemented,

secure, and meets standards, with no

major issues or flaws.



\## OTHER REQUIREMENTS – 2 points



32

Scored based on the teacher’s perception; UI/UX^

only abovebasic interface gets no points)-average work earns points (a \*\*0.\*\*^



```

Basic UI and UX are present but

inconsistent, with some usability

issues and limited visual appeal.

```

```

The website has some user-friendly

elements but lacks consistency in design

and navigation. While basic usability is

present, there are still significant areas

for improvement that could enhance

user experience.

```

```

UI and UX are well-designed, intuitive, and

visually appealing, providing a seamless

and engaging user experience.

```



```

33

Teamworking

(Working solo or without GitHub

Insights proof won’t earn this point)

```

```

0\.

```

```

No evidence of teamwork on

GitHub; contributions are

sporadic or missing, with no early

or regular commits.

```

```

Some teamwork is visible with

occasional commits, but work

distribution is uneven, and there are

delays or a lack of early contributions.

```

```

Evidence of effective teamwork with

balanced work distribution, early and

regular commits, and proactive

collaboration throughout the project.

```

```

34

Scored based on the teacher’s perception; Responsive^

only abovebasic interface gets no points)-average work earns points (a 0.^

```

```

The website is not responsive; it

does not adjust to different

screen sizes or devices. Users

experience layout issues, making

navigation difficult.

```

```

The website has some responsive

elements but is not fully optimized.

Certain pages or components may not

display correctly on all devices, leading

to inconsistent user experiences.

```

```

The website is fully responsive, providing

an optimal user experience across all

devices. All elements, layouts, and

functionalities adjust seamlessly to

different screen sizes, ensuring easy

navigation.

```

```

35 Horizontal scaling 0.

```

```

The application is not designed

for horizontal scaling; it relies on

a single server. This limits

performance and may cause

downtime under increased load.

```

```

The application shows some potential

for horizontal scaling but is not fully

implemented. Some components can be

distributed across multiple servers, but

there may be issues with load balancing

or state management

```

```

The application is fully designed for

horizontal scaling. It effectively utilizes

multiple servers, employs load balancing,

and maintains a stateless architecture,

allowing for seamless handling of

increased traffic.

```

The description provided above is intended as a general guideline and cannot be considered as a detailed step-by-step implementation

for each feature, specifying what is right or wrong. However, during the grading process, the features must be developed based on these

descriptions, particularly those highlighted in a distinct color. These features must be implemented to a relatively high standard in order

to qualify for maximum points. Teams should actively refer to related applications and apply their daily user experience with such

applications to the task. For example:



\- Displaying product price:

&nbsp;   o Poor approach: Display data directly from the database as “ 75299000 ”, which is hard to read.

&nbsp;   o Better approach: Format as “75,299,000đ” with commas and currency, improving clarity and readability.

\- When showing order list:

&nbsp;   o Poor approach: Only uses “select all” from the database, displaying data in ascending order. New orders appear at the

&nbsp;      bottom, with no pagination, making it difficult to search. Important information like total amount, buyer name, status, and

&nbsp;      date formats are not clearly displayed.

&nbsp;   o Better approach: Sort data in descending order by date, so new orders are on top. Implement pagination for easier viewing,

&nbsp;      ensuring all important information is displayed clearly with proper formatting and appropriate color coding.





\### IV. OUTPUT REQUIREMENTS



\- Required submission components include:

&nbsp;   o The " \*\*source\*\* " folder:

&nbsp;      § \*\*if you do not use docker compose\*\* : the source folder should contain the entire source code of the web app (e.g.

&nbsp;         frontend, backend), along with relevant database files. Ensure that this source code can be run on the teacher's

&nbsp;         computer. The project needs to be "cleaned" to remove unnecessary content before submission and to reduce the

&nbsp;         size of the compressed file.

&nbsp;      § \*\*if you use docker compose\*\* : This folder must contain all source code for the necessary modules, the docker-compose

&nbsp;         file, and instructions for running the application on the instructor’s machine (e.g., where to run npm install and

&nbsp;         docker-compose up). Ensure thorough testing is completed before submission.

&nbsp;   o Introduction video " \*\*demo.mp4\*\* ": A team representative should record a screen presentation showcasing the group's

&nbsp;      application, highlighting ALL features based on self-assessment. The video, with a minimum resolution of 1080p, should

&nbsp;      have clear and audible sound without theoretical explanations.

&nbsp;   o The “ \*\*git\*\* ” folder: Contains screenshots that demonstrate collaboration between team members on the github or gitlab repo.

&nbsp;      Multiple screenshots may be submitted, as long as there is evidence of effective teamwork with balanced work distribution,

&nbsp;      early and regular commits, and proactive collaboration throughout the project. Evidence of teamwork must clearly indicate

&nbsp;      that the project duration from the start to the present is at least one month, during which each member must have at least

&nbsp;      two commits per week.

&nbsp;   o \*\*Readme.txt\*\* file: Provide all necessary information for the evaluation process, such as project building and running

&nbsp;      instructions, URL + server login information (if applicable), and usernames/passwords for accounts with pre-loaded data for

&nbsp;      assessment. Include any relevant notes on building, running, and using the application for teachers to reproduce the project.

&nbsp;      If your team implements some optional features (which get extra points), it should be clearly stated in the readme file.

&nbsp;   o \*\*The “Bonus”\*\* folder \*\*:\*\* The bonus folder should include a description of the extra features your team implemented for

&nbsp;      additional points, along with evidence. Organize the information clearly, concisely, and convincingly.

&nbsp;   o \*\*Rubrik.docx:\*\* This file lists the required features for the project. Teams should self-assess their completion level in this file.

&nbsp;      The instructor will provide this file at the submission time. The file will also include the public URL to the web application

&nbsp;      and any required username/password for login.





\- Organize all the above contents into a folder named \*\*id1\_fullname1\_id2\_fullname2\*\* , then compress this folder in ZIP format with

&nbsp;   the same name, e.g., id1\_fullname1\_id2\_fullname2.zip. A team representative should submit this file on the online learning system

&nbsp;   as instructed by the course instructor.

\- Teachers do not accept sumissions via email, only elearning is accepted.



\### IV. IMPORTANT NOTES



\- The Final Project must be implemented using a \*\*Nodejs\*\* project using the \*\*Javascript\*\* programming language. You are allowed to use

&nbsp;   any libraries or frameworks for both the front-end and back-end, as long as they are based on Node.js.

\- If your team submits an unrelated project, it will not be graded, and the entire team will receive a score of 0. For example, if your

&nbsp;   team uses the source code from a different e-commerce site and only implements a few features related to this assignment while

&nbsp;   most features are unrelated, the project will receive 0 points.

\- The Essay is entirely independent of the Final Project. Therefore, all team members must participate in both the Essay and the Final

&nbsp;   Project. The Essay will be assessed by the lab instructor, while the Final Project will be assessed by the theoretical instructor.

\- Groups are prohibited from sharing code with each other, obtaining source code from the internet, and must take responsibility

&nbsp;   for protecting their group's source code. Groups with similar source code (verified by specialized software) or code found online,

&nbsp;   even if only in part, will receive a score of 0 for all members, regardless of which group shared or received the code.

\- Failure to submit source code will result in the entire team receiving a score of 0.

\- If the team does not fill out and submit the \*\*rubrik.docx\*\* file, the submission will not be graded.

\- If your team fails to deploy the project (e.g., public hosting or Docker Compose) or does not provide an introductory video, the

&nbsp;   submission will not be graded.

\- Deductions will also apply in the following situations:

&nbsp;   o Late submission: 1-day late deducts 1 point. Submissions late by 1 second to less than 1 day are considered 1 day late.

&nbsp;   o Complex project configuration without specific instructions for instructors to compile and run the program: Deduction of 2

&nbsp;      points.

&nbsp;   o Submit the entire project without performing a clean to remove unnecessary files: 0.5 point.

&nbsp;   o Failure to provide necessary grading information, such as missing usernames/passwords, incorrect file naming, or not

&nbsp;      submitting required content: 1.0 point.







