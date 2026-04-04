/**
 * Seed script — populates the database with dummy data for development.
 * Run with:  node src/db/seed.js
 */

const db = require('./database');

// -------------------------------------------------------------------
// Clear existing data (order matters because of foreign keys)
// -------------------------------------------------------------------
db.exec(`
    DELETE FROM posts;
    DELETE FROM group_members;
    DELETE FROM club_groups;
    DELETE FROM transfers;
    DELETE FROM lend_requests;
    DELETE FROM books;
    DELETE FROM members;
`);

// -------------------------------------------------------------------
// 1. Members
// -------------------------------------------------------------------
const insertMember = db.prepare(
    `INSERT INTO members (name, email, phone) VALUES (?, ?, ?)`
);

const members = [
    ['Alice Johnson', 'alice@bookclub.com', '555-0101'],
    ['Bob Martinez', 'bob@bookclub.com', '555-0102'],
    ['Charlie Lee', 'charlie@bookclub.com', '555-0103'],
    ['Diana Patel', 'diana@bookclub.com', '555-0104'],
    ['Ethan Brown', 'ethan@bookclub.com', '555-0105'],
    ['Fiona Davis', 'fiona@bookclub.com', '555-0106'],
    ['George Wilson', 'george@bookclub.com', '555-0107'],
    ['Hannah Kim', 'hannah@bookclub.com', '555-0108'],
];

const insertManyMembers = db.transaction(() => {
    for (const m of members) insertMember.run(...m);
});
insertManyMembers();
console.log(`✔  Inserted ${members.length} members`);

// -------------------------------------------------------------------
// 2. Books
// -------------------------------------------------------------------
const insertBook = db.prepare(
    `INSERT INTO books (title, author, isbn, genre, owner_id, status) VALUES (?, ?, ?, ?, ?, ?)`
);

const books = [
    // Alice's books (owner_id = 1)
    ['The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Classic', 1, 'available'],
    ['To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Classic', 1, 'lent'],
    ['1984', 'George Orwell', '978-0-45-152493-5', 'Dystopian', 1, 'available'],

    // Bob's books (owner_id = 2)
    ['Dune', 'Frank Herbert', '978-0-44-117271-9', 'Sci-Fi', 2, 'available'],
    ['The Hobbit', 'J.R.R. Tolkien', '978-0-54-792822-7', 'Fantasy', 2, 'lent'],
    ['Neuromancer', 'William Gibson', '978-0-44-156959-6', 'Sci-Fi', 2, 'available'],

    // Charlie's books (owner_id = 3)
    ['Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Romance', 3, 'available'],
    ['The Catcher in the Rye', 'J.D. Salinger', '978-0-31-676948-0', 'Classic', 3, 'available'],

    // Diana's books (owner_id = 4)
    ['Sapiens', 'Yuval Noah Harari', '978-0-06-231609-7', 'Non-Fiction', 4, 'available'],
    ['Educated', 'Tara Westover', '978-0-39-959050-4', 'Memoir', 4, 'lent'],
    ['Atomic Habits', 'James Clear', '978-0-73-521129-2', 'Self-Help', 4, 'available'],

    // Ethan's books (owner_id = 5)
    ['The Martian', 'Andy Weir', '978-0-55-341802-6', 'Sci-Fi', 5, 'available'],
    ['Project Hail Mary', 'Andy Weir', '978-0-59-313562-9', 'Sci-Fi', 5, 'available'],

    // Fiona's books (owner_id = 6)
    ['Becoming', 'Michelle Obama', '978-1-52-476313-8', 'Memoir', 6, 'available'],
    ['The Alchemist', 'Paulo Coelho', '978-0-06-112241-5', 'Fiction', 6, 'lent'],

    // George's books (owner_id = 7)
    ['Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Tech', 7, 'available'],
    ['The Pragmatic Programmer', 'David Thomas', '978-0-13-595705-9', 'Tech', 7, 'available'],

    // Hannah's books (owner_id = 8)
    ['Norwegian Wood', 'Haruki Murakami', '978-0-37-570402-2', 'Fiction', 8, 'available'],
    ['Kafka on the Shore', 'Haruki Murakami', '978-1-40-003947-6', 'Fiction', 8, 'available'],
];

const insertManyBooks = db.transaction(() => {
    for (const b of books) insertBook.run(...b);
});
insertManyBooks();
console.log(`✔  Inserted ${books.length} books`);

// -------------------------------------------------------------------
// 3. Lend Requests
// -------------------------------------------------------------------
const insertLendReq = db.prepare(
    `INSERT INTO lend_requests (book_id, borrower_id, status, requested_at, approved_at, returned_at)
     VALUES (?, ?, ?, ?, ?, ?)`
);

const lendRequests = [
    // Alice's "To Kill a Mockingbird" (book 2) — lent to Charlie, approved
    [2, 3, 'approved', '2026-02-10 10:00:00', '2026-02-11 09:00:00', null],
    // Bob's "The Hobbit" (book 5) — lent to Diana, approved
    [5, 4, 'approved', '2026-02-15 14:00:00', '2026-02-16 08:30:00', null],
    // Diana's "Educated" (book 10) — lent to Fiona, approved
    [10, 6, 'approved', '2026-03-01 11:00:00', '2026-03-02 10:00:00', null],
    // Fiona's "The Alchemist" (book 16) — lent to Ethan, approved
    [16, 5, 'approved', '2026-03-05 09:00:00', '2026-03-05 18:00:00', null],
    // Pending request: George wants Alice's "1984" (book 3)
    [3, 7, 'pending', '2026-03-12 16:00:00', null, null],
    // Returned: Hannah borrowed Alice's "The Great Gatsby" (book 1) and returned
    [1, 8, 'returned', '2026-01-20 12:00:00', '2026-01-21 09:00:00', '2026-02-05 10:00:00'],
    // Rejected: Ethan tried to borrow Charlie's "Pride and Prejudice" (book 7)
    [7, 5, 'rejected', '2026-02-20 15:00:00', null, null],
];

const insertManyLendReqs = db.transaction(() => {
    for (const l of lendRequests) insertLendReq.run(...l);
});
insertManyLendReqs();
console.log(`✔  Inserted ${lendRequests.length} lend requests`);

// -------------------------------------------------------------------
// 4. Transfers (permanent ownership changes)
// -------------------------------------------------------------------
const insertTransfer = db.prepare(
    `INSERT INTO transfers (book_id, from_member_id, to_member_id, transferred_at)
     VALUES (?, ?, ?, ?)`
);

const transfers = [
    // Example: Ethan gave "The Martian" to Bob at some point, then Bob gave it back
    // (for simplicity, let's just record a couple of historical transfers)
    [12, 5, 2, '2025-12-01 10:00:00'],  // Ethan → Bob (The Martian)
    [12, 2, 5, '2026-01-15 14:00:00'],  // Bob → Ethan (The Martian returned as gift back)
];

const insertManyTransfers = db.transaction(() => {
    for (const t of transfers) insertTransfer.run(...t);
});
insertManyTransfers();
console.log(`✔  Inserted ${transfers.length} transfers`);

// -------------------------------------------------------------------
// 5. Groups
// -------------------------------------------------------------------
const insertGroup = db.prepare(
    `INSERT INTO club_groups (name, description, created_by) VALUES (?, ?, ?)`
);

const groups = [
    ['Sci-Fi Enthusiasts', 'For fans of science fiction — from Asimov to Weir!', 2],
    ['Classic Literature', 'Discussing the timeless works of literature.', 1],
    ['Non-Fiction Nerds', 'Books that teach us about the real world.', 4],
    ['Tech Reads', 'Software engineering, design, and beyond.', 7],
];

const insertManyGroups = db.transaction(() => {
    for (const g of groups) insertGroup.run(...g);
});
insertManyGroups();
console.log(`✔  Inserted ${groups.length} groups`);

// -------------------------------------------------------------------
// 6. Group Members
// -------------------------------------------------------------------
const insertGroupMember = db.prepare(
    `INSERT INTO group_members (group_id, member_id, role) VALUES (?, ?, ?)`
);

const groupMembers = [
    // Sci-Fi Enthusiasts (group 1) — Bob is admin
    [1, 2, 'admin'], [1, 5, 'member'], [1, 6, 'member'], [1, 8, 'member'],
    // Classic Literature (group 2) — Alice is admin
    [2, 1, 'admin'], [2, 3, 'member'], [2, 4, 'member'],
    // Non-Fiction Nerds (group 3) — Diana is admin
    [3, 4, 'admin'], [3, 1, 'member'], [3, 6, 'member'], [3, 7, 'member'],
    // Tech Reads (group 4) — George is admin
    [4, 7, 'admin'], [4, 2, 'member'], [4, 5, 'member'],
];

const insertManyGroupMembers = db.transaction(() => {
    for (const gm of groupMembers) insertGroupMember.run(...gm);
});
insertManyGroupMembers();
console.log(`✔  Inserted ${groupMembers.length} group memberships`);

// -------------------------------------------------------------------
// 7. Posts
// -------------------------------------------------------------------
const insertPost = db.prepare(
    `INSERT INTO posts (group_id, author_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)`
);

const posts = [
    // Sci-Fi Enthusiasts posts
    [1, 2, 'Just finished Dune — mind blown!',
        'The world-building in Dune is absolutely incredible. Herbert creates such a rich political and ecological landscape. Who else has read the sequels?',
        '2026-03-01 10:30:00'],
    [1, 5, 'Project Hail Mary appreciation post',
        'Andy Weir does it again. The friendship between Ryland and Rocky is one of the best things I have ever read. Highly recommend!',
        '2026-03-05 14:00:00'],
    [1, 8, 'Neuromancer — the OG cyberpunk',
        'Started reading Neuromancer from Bob\'s collection. Gibson was so ahead of his time. The prose is dense but rewarding.',
        '2026-03-10 09:15:00'],

    // Classic Literature posts
    [2, 1, 'Monthly pick: The Great Gatsby',
        'Let\'s discuss Gatsby this month! I think the green light symbolism is overanalyzed, but the commentary on the American Dream is timeless. Thoughts?',
        '2026-03-02 11:00:00'],
    [2, 3, 'Catcher in the Rye — love it or hate it?',
        'I know Holden Caulfield is polarizing. Personally, I think Salinger captures teenage angst perfectly. What do you all think?',
        '2026-03-08 16:45:00'],

    // Non-Fiction Nerds posts
    [3, 4, 'Sapiens changed my perspective',
        'Harari has a gift for making complex history accessible. The cognitive revolution chapter blew my mind. Currently reading Homo Deus next.',
        '2026-03-03 08:00:00'],
    [3, 6, 'Becoming — more than a memoir',
        'Michelle Obama\'s writing is so genuine. It reads less like a political memoir and more like a conversation with a friend.',
        '2026-03-07 13:30:00'],

    // Tech Reads posts
    [4, 7, 'Clean Code — still relevant?',
        'Some argue Clean Code is outdated, but I think the core principles (meaningful names, small functions, DRY) are timeless. What do you think?',
        '2026-03-04 17:00:00'],
    [4, 2, 'Pragmatic Programmer tips I use daily',
        'The "tracer bullet" approach and "don\'t repeat yourself" have genuinely changed how I write software. George, thanks for lending me this one!',
        '2026-03-09 10:00:00'],
];

const insertManyPosts = db.transaction(() => {
    for (const p of posts) insertPost.run(...p);
});
insertManyPosts();
console.log(`✔  Inserted ${posts.length} posts`);

// -------------------------------------------------------------------
console.log('\n🎉 Database seeded successfully!');
console.log(`   Database file: ${db.name}`);
process.exit(0);
