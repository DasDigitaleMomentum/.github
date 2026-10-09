# Contributing

Thanks for your interest in contributing to a project of [Das Digitale Momentum](https://github.com/DasDigitaleMomentum). This guide applies to every public repository that does not ship its own `CONTRIBUTING.md`; a repository-specific guide always takes precedence.

## Before you start

- **Bugs:** search the existing issues first. If nothing matches, open an issue using the bug report form.
- **Features and larger changes:** open an issue or a discussion before writing code, so we can agree on the approach before you invest time.
- **Questions:** use the repository's Discussions tab where available, otherwise open an issue.
- **Security issues:** never report them publicly. Follow the [security policy](SECURITY.md).

## Making a change

1. Fork the repository and create a branch from the default branch, named `feat/<short-description>`, `fix/<short-description>` or `chore/<short-description>`.
2. Keep the change focused on one topic. Unrelated refactoring or formatting belongs in a separate pull request.
3. Follow the existing code style. If the repository has a linter, formatter or `.editorconfig`, your change must pass them.
4. Add or update tests for behaviour you change, where the repository has tests.
5. Update documentation that your change makes outdated.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat(cli): add --dry-run flag
fix: handle empty config file
docs(readme): document the install script
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`.

## Pull requests

- Fill in the pull request template and link the related issue (`Closes #123`).
- All CI checks must pass and at least one maintainer must approve.
- Pull requests are squash-merged; the pull request title becomes the commit message, so write it as a Conventional Commit.

## License

By contributing, you agree that your contributions are licensed under the license of the repository you contribute to (see its `LICENSE` file).

## Code of Conduct

Everyone taking part in our projects is expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
