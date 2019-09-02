[![Build Status](https://travis-ci.org/naorzr/feathers-mongoose-acl.svg?branch=master)](https://travis-ci.org/naorzr/feathers-mongoose-acl)
[![Coverage Status](https://coveralls.io/repos/github/naorzr/feathers-mongoose-acl/badge.svg?branch=master)](https://coveralls.io/github/naorzr/feathers-mongoose-acl?branch=master)
# feathers-mongoose-acl
feathers-mongoose-acl (or fma for short) gives you the power to add a simple yet powerful access layer mechanism to your feathers-mongoose app.

fma comes built it with two layers of access control.    
Document level access control and Field level access control.

With document level access layer, you can control which user role can have access to a document inside each service method call.   
With field level access layer, you can control which user can a field in the document.

### Getting Started
```npm i feathers-mongoose-acl```

### Basic Usage Example

```
import {OR, ACCESS_LAYER, AccessLayerHookExternal} from 'feathers-mongoose-acl'
const createdByUser = context => {createdBy: context.params.user._id}
const assignedToUser = context => {assignedTo: context.params.user._id}

const access: ACCESS_LAYER = {
  DOC_ACCESS: {
    find: { ADMIN: true, '*': OR(createdByUser, assignedToUser)},
    remove: { ADMIN: true }
  },
  NONE_PATCHABLE_FIELDS: {
    ADMIN: {},
    '*': {
      fields: ['deleted', 'role', 'account'],
      throw: true
    }
  }
}

const getUserRoleFromContext = context => context.params.user.role

const before: Partial<HookMap> = {
  all: [index.authenticate(['jwt']), AccessLayerHookExternal(getUserRoleFromContext, access)]
}
```

Let's unpack what we've done here.   
1. we create access layer object. each access layer object has doc access, and none_patchable_fields.   
in doc access, we defined for each method the user roles that have access to a document through service method calls.
for example in "find" method, we give admin user permission to access all documents, but for all other user roles
we only allow a user to access a document if he created it or if he is assigned to it.
2. we defined none patchable fields, as their name indicates, once defined for a role, if he tries to modify them through patch, he will recieve an error.(if defined ```throw: true```)
3. we define a way to extract user role from the given context
4. finally, we pass in the userRoleExtraction function and access object to the service before hook


### Typescript
feathers-mongoose-acl comes with internal typescript support


### Test
To test it locally please run

```npm run test:local```

### Contribution
Any type of contribution is welcomed, feel free to pm me 💓
