import { EntityRepository, Repository } from "typeorm";
import { User } from "./User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User> {
    return this.findOne({ email: email });
  }
}