export const getProfileInfo = async () => {
    const result = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
        query getProfileInfo($username: String!) {
          user(login: $username) {
            login
            url
            pinnedItems(first: 6) {
              nodes {
                ... on Repository {
                  id
                  name
                  nameWithOwner
                  url
                  description
                  stargazerCount
                }
              }
            }
            followers {
              totalCount
            }
            following {
              totalCount
            }
          }
        }
        `,
        variables: {
          username: "Anish-Shobith",
        },
      }),
    });
    return (await result.json())?.data?.user;
  };
