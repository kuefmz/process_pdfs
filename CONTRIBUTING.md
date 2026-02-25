# Contributing to PDF Processor

Thanks for your interest in contributing! Here are some guidelines:

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kuefmz/process_pdfs.git
   cd process_pdfs
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend (in another terminal)
   cd backend
   npm install
   ```

3. **Start development servers**
   ```bash
   # Frontend (from frontend directory)
   npm run dev

   # Backend (from backend directory)
   npm run dev
   ```

## Code Style

- Use 2 spaces for indentation
- Follow ESLint rules (run `npm run lint` in frontend)
- Write meaningful commit messages
- Keep components small and focused

## Making Changes

1. Create a branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request

## Areas for Improvement

- **PDF Signing**: Currently just returns the original PDF. Implement actual signature embedding.
- **Error Handling**: Better error messages and user feedback
- **Testing**: Add unit and integration tests
- **Performance**: Optimize for larger PDFs
- **Features**: Watermarks, compression, image-to-PDF conversion
- **Accessibility**: Improve a11y in the UI

## Reporting Issues

When reporting bugs:
- Describe the issue clearly
- Include steps to reproduce
- Browser/Node version
- Expected vs actual behavior

## Pull Request Process

1. Update documentation as needed
2. Follow the existing code style
3. Test your changes
4. Request review from maintainers
5. Address feedback

## Questions?

Open an issue or discussion in the repository!
