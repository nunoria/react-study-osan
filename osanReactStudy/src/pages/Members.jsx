import { TeamMemberCard } from "../components/Card";
import memberList from "../jsons/member.json";

export default function Members() {
  return (
    <div>
      <section id="header" className="container-fluid mx-auto p-4">
        <h1 className="text-2xl font-bold">Team Members</h1>
      </section>
      <section id="team_members" className="container-fluid mx-auto p-4">
        <div
          className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4
        gap-3 md:gap-4"
        >
          {memberList.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
          <TeamMemberCard />
        </div>
      </section>
    </div>
  );
}
