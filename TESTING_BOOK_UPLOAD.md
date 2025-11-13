# Testing the Book Upload Feature

## Quick Start Testing Guide

### Prerequisites
1. Backend server running on `http://localhost:3001`
2. Frontend server running on `http://localhost:5173`
3. Firebase project configured with Storage enabled
4. At least one teacher and one student account created

## Test Scenarios

### 1. Teacher Upload Flow ✅

#### Test Case 1.1: Successful Upload
**Steps:**
1. Login as a teacher
2. Navigate to Library page
3. Click "Upload Book" button
4. Select a PDF file (under 50MB)
5. Enter book details:
   - Title: "Mathematics Grade 10"
   - Description: "Complete mathematics textbook for grade 10"
   - Category: "Mathematics"
   - Grade Level: "Grade 10-11"
6. Click "Upload"

**Expected Result:**
- ✅ Upload progress indicator shows
- ✅ Success toast notification appears
- ✅ Book appears in the library grid
- ✅ Dialog closes automatically

#### Test Case 1.2: Upload Validation - No File
**Steps:**
1. Click "Upload Book"
2. Fill only the title field
3. Click "Upload" without selecting a file

**Expected Result:**
- ✅ Error toast: "Please select a PDF file"
- ✅ Upload does not proceed

#### Test Case 1.3: Upload Validation - Wrong File Type
**Steps:**
1. Click "Upload Book"
2. Try to select a JPG/PNG file

**Expected Result:**
- ✅ Error toast: "Only PDF files are allowed"
- ✅ File not selected

#### Test Case 1.4: Upload Validation - Large File
**Steps:**
1. Click "Upload Book"
2. Try to select a PDF over 50MB

**Expected Result:**
- ✅ Error toast: "File size should be less than 50MB"
- ✅ File not selected

#### Test Case 1.5: Upload Validation - No Title
**Steps:**
1. Select a valid PDF
2. Leave title field empty
3. Click "Upload"

**Expected Result:**
- ✅ Error toast: "Please enter a title"
- ✅ Upload does not proceed

### 2. Student View Flow ✅

#### Test Case 2.1: Browse Books
**Steps:**
1. Login as a student
2. Navigate to Library page

**Expected Result:**
- ✅ All published books are visible
- ✅ No "Upload Book" button visible
- ✅ No delete buttons on books

#### Test Case 2.2: View Book
**Steps:**
1. Click "View" button on any book

**Expected Result:**
- ✅ PDF viewer modal opens
- ✅ PDF displays in iframe
- ✅ Download button visible
- ✅ Full screen button visible
- ✅ Close button works

#### Test Case 2.3: Download Book
**Steps:**
1. Click download icon on a book card

**Expected Result:**
- ✅ Download starts
- ✅ Success toast appears
- ✅ Download count increments (visible on refresh)

#### Test Case 2.4: Download from Viewer
**Steps:**
1. Click "View" on a book
2. Click "Download" in viewer

**Expected Result:**
- ✅ Download starts
- ✅ Success toast appears
- ✅ Viewer remains open

#### Test Case 2.5: Full Screen Mode
**Steps:**
1. Click "View" on a book
2. Click "Full Screen" button

**Expected Result:**
- ✅ PDF opens in new browser tab
- ✅ Full browser PDF controls available

### 3. Search and Filter Flow ✅

#### Test Case 3.1: Search by Title
**Steps:**
1. Enter "Mathematics" in search box
2. Click search button or press Enter

**Expected Result:**
- ✅ Only books with "Mathematics" in title/description show
- ✅ Other books are filtered out

#### Test Case 3.2: Filter by Category
**Steps:**
1. Select "Physics" from category dropdown

**Expected Result:**
- ✅ Only Physics books display
- ✅ Filter persists on page

#### Test Case 3.3: Filter by Grade Level
**Steps:**
1. Select "Grade 10-11" from grade level dropdown

**Expected Result:**
- ✅ Only books for that grade level show
- ✅ Filter persists on page

#### Test Case 3.4: Combined Filters
**Steps:**
1. Enter search term
2. Select category
3. Select grade level

**Expected Result:**
- ✅ Books matching ALL criteria display
- ✅ Results update correctly

#### Test Case 3.5: Clear Filters
**Steps:**
1. Set filters
2. Change all to "all" or clear search

**Expected Result:**
- ✅ All books display again
- ✅ No errors occur

### 4. Teacher Management Flow ✅

#### Test Case 4.1: View Own Books
**Steps:**
1. Login as teacher who uploaded books
2. Navigate to Library

**Expected Result:**
- ✅ Delete button appears on own books
- ✅ No delete button on other teachers' books

#### Test Case 4.2: Delete Own Book
**Steps:**
1. Click delete (trash) icon on own book
2. Confirm deletion in dialog

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Book removed from list
- ✅ Success toast appears
- ✅ File deleted from Storage

#### Test Case 4.3: Cancel Delete
**Steps:**
1. Click delete icon
2. Click "Cancel" in dialog

**Expected Result:**
- ✅ Dialog closes
- ✅ Book remains in list
- ✅ No changes made

#### Test Case 4.4: Cannot Delete Other's Books
**Steps:**
1. Login as Teacher A
2. Try to access/delete Teacher B's book via API

**Expected Result:**
- ✅ API returns 403 Forbidden
- ✅ No delete button visible in UI

### 5. Statistics Tracking ✅

#### Test Case 5.1: View Count
**Steps:**
1. Click "View" on a book
2. Close viewer
3. Refresh page

**Expected Result:**
- ✅ View count increments by 1
- ✅ Visible on book card

#### Test Case 5.2: Download Count
**Steps:**
1. Download a book
2. Refresh page

**Expected Result:**
- ✅ Download count increments by 1
- ✅ Visible on book card

#### Test Case 5.3: Multiple Views/Downloads
**Steps:**
1. View same book multiple times
2. Download same book multiple times

**Expected Result:**
- ✅ Counts increment each time
- ✅ Statistics accurate

### 6. Edge Cases and Error Handling ✅

#### Test Case 6.1: No Books Available
**Steps:**
1. Filter to criteria with no matches

**Expected Result:**
- ✅ Empty state displays
- ✅ Message: "No books found"
- ✅ Helpful icon shown

#### Test Case 6.2: Network Error During Upload
**Steps:**
1. Start upload
2. Disconnect internet
3. Wait for timeout

**Expected Result:**
- ✅ Error toast appears
- ✅ Upload can be retried
- ✅ Dialog remains open

#### Test Case 6.3: Unauthorized Access
**Steps:**
1. Logout
2. Try to access `/api/books` endpoint directly

**Expected Result:**
- ✅ 401 Unauthorized error
- ✅ Redirected to login

#### Test Case 6.4: Invalid Book ID
**Steps:**
1. Try to view non-existent book ID

**Expected Result:**
- ✅ 404 error handled
- ✅ User-friendly error message

### 7. Responsive Design Testing ✅

#### Test Case 7.1: Mobile View (375px)
**Steps:**
1. Resize browser to mobile size
2. Navigate Library page

**Expected Result:**
- ✅ Single column grid
- ✅ All buttons accessible
- ✅ Search/filters stack vertically
- ✅ Cards display properly

#### Test Case 7.2: Tablet View (768px)
**Steps:**
1. Resize to tablet size

**Expected Result:**
- ✅ 2-column grid
- ✅ Filters display nicely
- ✅ No horizontal scroll

#### Test Case 7.3: Desktop View (1280px+)
**Steps:**
1. View on desktop

**Expected Result:**
- ✅ 3-4 column grid
- ✅ All filters in one row
- ✅ Optimal spacing

## Manual Testing Checklist

### Before Testing:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Firebase configured
- [ ] Test accounts created (1 teacher, 1 student)
- [ ] Sample PDF files ready (various sizes)

### Teacher Account Tests:
- [ ] Upload valid book
- [ ] Upload without file (validation)
- [ ] Upload wrong file type (validation)
- [ ] Upload too large file (validation)
- [ ] Upload without title (validation)
- [ ] View uploaded book
- [ ] Download uploaded book
- [ ] Delete own book
- [ ] Cannot delete others' books
- [ ] See correct statistics

### Student Account Tests:
- [ ] View all published books
- [ ] Cannot see upload button
- [ ] Cannot see delete buttons
- [ ] View book in PDF viewer
- [ ] Download book from card
- [ ] Download book from viewer
- [ ] Open book in full screen
- [ ] Search for books
- [ ] Filter by category
- [ ] Filter by grade level
- [ ] Combined search and filters

### UI/UX Tests:
- [ ] Loading states display correctly
- [ ] Success toasts appear
- [ ] Error toasts appear with helpful messages
- [ ] Dialogs open/close smoothly
- [ ] Forms validate properly
- [ ] Buttons disabled during operations
- [ ] Hover effects work
- [ ] Animations smooth

### Performance Tests:
- [ ] Upload 5MB PDF (fast)
- [ ] Upload 25MB PDF (reasonable)
- [ ] Upload 49MB PDF (near limit)
- [ ] Load 50+ books (pagination needed in future)
- [ ] Search with many results
- [ ] Filter switches quickly

## Automated Testing (Future)

### API Tests (Jest + Supertest):
```javascript
describe('Books API', () => {
  test('POST /api/books/upload - success', async () => {
    // Upload test
  });
  
  test('GET /api/books - list books', async () => {
    // List test
  });
  
  test('DELETE /api/books/:id - teacher deletes own', async () => {
    // Delete test
  });
  
  test('DELETE /api/books/:id - cannot delete others', async () => {
    // Permission test
  });
});
```

### Frontend Tests (Vitest + React Testing Library):
```javascript
describe('Library Page', () => {
  test('renders book cards', () => {
    // Render test
  });
  
  test('opens upload dialog for teachers', () => {
    // Dialog test
  });
  
  test('filters books by category', () => {
    // Filter test
  });
});
```

## Common Issues and Solutions

### Issue 1: "Failed to upload book"
**Solution:** 
- Check Firebase Storage is enabled
- Verify storage bucket name in config
- Check Firebase Storage rules

### Issue 2: "PDF not displaying in viewer"
**Solution:**
- Verify file is publicly accessible
- Check CORS settings
- Try opening in new tab
- Check browser PDF support

### Issue 3: "Permission denied"
**Solution:**
- Verify user role in Firestore
- Check Firestore security rules
- Ensure user is authenticated

### Issue 4: "File too large" even with valid file
**Solution:**
- Check both frontend (50MB) and backend (50MB) limits
- Verify multer configuration
- Check Firebase Storage quota

## Success Criteria

The feature is working correctly if:

✅ Teachers can upload PDFs successfully  
✅ Students can view all published books  
✅ PDF viewer displays books correctly  
✅ Download tracking works  
✅ View tracking works  
✅ Search and filters function properly  
✅ Teachers can delete their own books  
✅ Role-based permissions enforced  
✅ All validations work  
✅ Error handling is user-friendly  
✅ UI is responsive and accessible  
✅ No console errors  
✅ Performance is acceptable  

## Next Test Phase

After basic testing passes:
1. Load testing with multiple concurrent uploads
2. Security testing (try to bypass permissions)
3. Accessibility testing (screen readers, keyboard navigation)
4. Cross-browser testing (Chrome, Firefox, Safari, Edge)
5. Mobile device testing (iOS Safari, Android Chrome)

## Reporting Issues

When reporting bugs, include:
1. User role (teacher/student)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser and version
6. Console errors
7. Screenshots if applicable

