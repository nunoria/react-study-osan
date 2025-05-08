import { TeamMemberCard } from "../components/Card";

const memberList = [
  {
    name: "nunoria",
    department: "Engineering",
    joinedAt: "2021-04-01",
  },
  {
    name: "sangwoo",
    department: "Design",
    joinedAt: "2020-03-15",
  },
  {
    name: "jiyoon",
    department: "Marketing",
    joinedAt: "2025-04-18",
  },
  {
    name: "sangyoon",
    // department: "Engineering",
    joinedAt: "2022-02-20",
  },
];

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
