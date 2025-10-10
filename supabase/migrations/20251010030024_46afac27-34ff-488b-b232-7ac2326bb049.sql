-- Add more aptitude test questions
INSERT INTO public.aptitude_test_questions (category, difficulty, question, option_a, option_b, option_c, option_d, correct_answer) VALUES
-- Logical Reasoning
('Logical Reasoning', 'Easy', 'If all roses are flowers and some flowers fade quickly, which statement must be true?', 'All roses fade quickly', 'Some roses might fade quickly', 'No roses fade quickly', 'All flowers are roses', 'B'),
('Logical Reasoning', 'Medium', 'In a race, if Mike finishes before John and John finishes before Paul, who finishes last?', 'Mike', 'John', 'Paul', 'Cannot be determined', 'C'),
('Logical Reasoning', 'Hard', 'If the day after tomorrow is Sunday, what day was the day before yesterday?', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'D'),

-- Quantitative Aptitude
('Quantitative', 'Easy', 'What is 15% of 200?', '20', '25', '30', '35', 'C'),
('Quantitative', 'Easy', 'If a car travels 60 km in 1 hour, how far will it travel in 2.5 hours at the same speed?', '120 km', '130 km', '140 km', '150 km', 'D'),
('Quantitative', 'Medium', 'The average of five numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?', '22', '25', '28', '30', 'C'),
('Quantitative', 'Medium', 'A shopkeeper marks up his goods by 40% and then gives a 20% discount. What is his net profit percentage?', '10%', '12%', '15%', '20%', 'B'),
('Quantitative', 'Hard', 'If the compound interest on Rs. 1000 for 2 years at 10% per annum is Rs. 210, what would be the simple interest?', 'Rs. 100', 'Rs. 150', 'Rs. 200', 'Rs. 250', 'C'),

-- Verbal Reasoning
('Verbal', 'Easy', 'Choose the word most similar to "Brave": ', 'Cowardly', 'Fearful', 'Courageous', 'Timid', 'C'),
('Verbal', 'Easy', 'Complete the analogy: Doctor : Hospital :: Teacher : ?', 'Classroom', 'Book', 'Student', 'School', 'D'),
('Verbal', 'Medium', 'If "COMPUTER" is coded as "DPNQVUFS", how is "MOBILE" coded?', 'NPCJMF', 'MPCJMF', 'NPCKMF', 'MOBJLE', 'A'),
('Verbal', 'Medium', 'Which word does not belong: Lion, Tiger, Bear, Leopard?', 'Lion', 'Tiger', 'Bear', 'Leopard', 'C'),
('Verbal', 'Hard', 'Find the missing word: Book is to Reading as Fork is to ?', 'Eating', 'Food', 'Cooking', 'Kitchen', 'A'),

-- Data Interpretation
('Data Interpretation', 'Medium', 'A pie chart shows: Sales A=40%, B=30%, C=20%, D=10%. If total sales = Rs.1,00,000, what is revenue from B?', 'Rs. 20,000', 'Rs. 25,000', 'Rs. 30,000', 'Rs. 35,000', 'C'),
('Data Interpretation', 'Hard', 'In a class of 50 students, 30 play cricket, 25 play football. If 10 play both, how many play neither?', '3', '5', '7', '10', 'B'),

-- Pattern Recognition
('Pattern Recognition', 'Easy', 'Find the next number: 2, 4, 8, 16, ?', '20', '24', '28', '32', 'D'),
('Pattern Recognition', 'Medium', 'Find the missing number: 3, 6, 11, 18, 27, ?', '36', '38', '40', '42', 'B'),
('Pattern Recognition', 'Hard', 'Complete the series: Z, Y, X, W, V, ?', 'U', 'T', 'S', 'R', 'A'),

-- Technical Aptitude (CS/IT)
('Technical', 'Easy', 'What does CPU stand for?', 'Central Processing Unit', 'Central Program Unit', 'Computer Processing Unit', 'Central Processor Unit', 'A'),
('Technical', 'Easy', 'Which of the following is not a programming language?', 'Python', 'Java', 'HTML', 'C++', 'C'),
('Technical', 'Medium', 'What is the time complexity of binary search?', 'O(n)', 'O(log n)', 'O(n log n)', 'O(1)', 'B'),
('Technical', 'Medium', 'In OOP, what does polymorphism mean?', 'One interface, multiple implementations', 'Multiple interfaces, one implementation', 'Data hiding', 'Code reusability', 'A'),
('Technical', 'Hard', 'What is the maximum number of nodes at level 3 in a binary tree?', '4', '6', '8', '16', 'C'),

-- Problem Solving
('Problem Solving', 'Easy', 'A clock shows 3:15. What is the angle between hour and minute hands?', '0°', '7.5°', '15°', '22.5°', 'B'),
('Problem Solving', 'Medium', 'How many times does the digit 5 appear between 1 and 100?', '10', '15', '19', '20', 'D'),
('Problem Solving', 'Hard', 'In how many ways can 5 people be seated in a row?', '20', '60', '120', '240', 'C');