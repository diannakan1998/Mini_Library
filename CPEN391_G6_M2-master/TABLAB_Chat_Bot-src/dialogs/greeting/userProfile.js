// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Simple user profile class.
 */
class UserProfile {
    constructor(name, library) {
        this.name = name || undefined;
        this.library = library || undefined;
    }
};

exports.UserProfile = UserProfile;