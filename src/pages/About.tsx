import React from 'react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Member 1",
    role: "Role 1",
    image: "/placeholder-avatar.png" // You'll need to replace this with actual image paths
  },
  {
    name: "Member 2",
    role: "Role 2",
    image: "/placeholder-avatar.png"
  },
  {
    name: "Member 3",
    role: "Role 3",
    image: "/placeholder-avatar.png"
  },
  {
    name: "Member 4",
    role: "Role 4",
    image: "/placeholder-avatar.png"
  }
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">About Our Team</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600 mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About; 