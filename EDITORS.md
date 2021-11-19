# Editors

## Visual Studio Code

### Enable auto-save

Add the following to your _User_ (all projects) or _Workspace_ (specific project) settings (Select _Code_/_Preferences_/_Settings_ and then search for "Code Actions On Save" and click the `Edit in settings.json` link).

```json
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
```
