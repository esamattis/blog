
generate:
	bundle exec rake generate

watch:
	bundle exec rake preview

livereload:
	bundle exec guard

deploy: generate
	bundle exec rake deploy
