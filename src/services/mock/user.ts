import type { UserService, User } from "../types";

const MOCK_USER: User = {
  id: "user-1",
  name: "ryoa",
  email: "ryoa@example.com",
};

export function createMockUserService(): UserService {
  return {
    async getCurrentUser() {
      return MOCK_USER;
    },
    login: undefined,
    logout: undefined,
  };
}
