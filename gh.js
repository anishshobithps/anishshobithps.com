var ghpages = require('gh-pages');

ghpages.publish(
	'public', // path to public directory
	{
		branch: 'gh-pages',
		repo: 'https://github.com/Anish-Shobith/website.git', // Update to point to your repository
		user: {
			name: 'Anish-Shobith', // update to use your name
			email: 'anish.shobith19@gmail.com' // Update to use your email
		},
		dotfiles: true
	},
	() => {
		console.log('Deploy Complete!');
	}
);
